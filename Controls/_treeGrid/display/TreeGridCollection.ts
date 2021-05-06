import { mixin } from 'Types/util';
import {TemplateFunction} from 'UI/Base';
import TreeGridDataRow, {IOptions as ITreeGridRowOptions} from './TreeGridDataRow';
import {
    TreeItem,
    Tree,
    GridLadderUtil,
    ItemsFactory,
    itemsStrategy,
    ITreeCollectionOptions, IItemActionsTemplateConfig, IHasMoreData
} from 'Controls/display';
import {
    GridGroupRow,
    GridMixin,
    IGridCollectionOptions
} from 'Controls/grid';
import TreeGridFooterRow from './TreeGridFooterRow';
import {Model as EntityModel, Model} from 'Types/entity';
import {IObservable} from 'Types/collection';
import {CrudEntityKey} from "Types/source";

export interface IOptions<S extends Model, T extends TreeGridDataRow<S>>
   extends IGridCollectionOptions<S, T>, ITreeCollectionOptions<S, T> {
    nodeTypeProperty?: string;
}

/**
 * Рекурсивно проверяет скрыт ли элемент сворачиванием родительских узлов
 * @param {TreeItem<T>} item
 */
function itemIsVisible<T extends Model>(item: TreeItem<T>): boolean  {
    if (item['[Controls/_display/GroupItem]'] || item['[Controls/_display/BreadcrumbsItem]']) {
        return true;
    }

    const parent = item.getParent();
    // корневой узел не может быть свернут
    if (!parent || parent['[Controls/_display/BreadcrumbsItem]'] || parent.isRoot()) {
        return true;
    } else if (!parent.isExpanded()) {
        return false;
    }

    return itemIsVisible(parent);
}

export default class TreeGridCollection<
    S extends Model,
    T extends TreeGridDataRow<S> = TreeGridDataRow<S>
> extends mixin<Tree<any>, GridMixin<any, any>>(Tree, GridMixin) {
    readonly '[Controls/treeGrid:TreeGridCollection]': boolean;

    protected _$nodeTypeProperty: string;

    constructor(options: IOptions<S, T>) {
        super(options);
        GridMixin.call(this, options);

        // TODO должно быть в Tree. Перенести туда, когда полностью перейдем на новую коллекцию TreeGrid.
        //  Если сразу в Tree положим, то все разломаем
        this.addFilter(
           (contents, sourceIndex, item, collectionIndex) => itemIsVisible(item)
        );
    }

    setNodeTypeProperty(nodeTypeProperty: string): void {
        this._$nodeTypeProperty = nodeTypeProperty;
        this._nextVersion();
    }

    getNodeTypeProperty(): string {
        return this._$nodeTypeProperty;
    }

    // TODO duplicate code with GridCollection. Нужно придумать как от него избавиться.
    //  Проблема в том, что mixin не умеет объединять одинаковые методы, а логику Grid мы добавляем через mixin
    // region override

    setEmptyTemplate(emptyTemplate: TemplateFunction): boolean {
        const superResult = super.setEmptyTemplate(emptyTemplate);
        if (superResult) {
            if (this._$emptyTemplate) {
                if (this._$emptyGridRow) {
                    this._$emptyGridRow.setRowTemplate(this._$emptyTemplate);
                } else {
                    this._initializeEmptyRow();
                }
            } else {
                this._$emptyGridRow = undefined;
            }
        }
        return superResult;
    }

    setMultiSelectVisibility(visibility: string): void {
        super.setMultiSelectVisibility(visibility);

        [this.getColgroup(), this.getHeader(), this.getResults(), this.getFooter(), this.getEmptyGridRow()].forEach((gridUnit) => {
            gridUnit?.setMultiSelectVisibility(visibility);
        });

        this._$colgroup?.reBuild();
    }

    setActionsTemplateConfig(config: IItemActionsTemplateConfig) {
        super.setActionsTemplateConfig(config);
        if (this.getFooter()) {
            this.getFooter().setActionsTemplateConfig(config);
        }
    }

    setHasMoreData(hasMoreData: IHasMoreData): void {
        super.setHasMoreData(hasMoreData);
        if (this.getFooter()) {
            this.getFooter().setHasMoreData(hasMoreData);
        }
    }

    protected _reBuild(reset?: boolean): void {
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties) && !!this._$ladder) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
        }
        super._reBuild(reset);
        this._$colgroup?.reBuild();
    }

    setIndexes(start: number, stop: number): void {
        super.setIndexes(start, stop);
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties)) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
            this._updateItemsLadder();
        }
        this._updateItemsProperty('setColumns', this._$columns);
    }

    protected _handleAfterCollectionChange(changedItems: TreeGridDataRow[], changeAction?: string): void {
        super._handleAfterCollectionChange(changedItems, changeAction);
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties)) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
            this._updateItemsLadder();
        }

        // Сбрасываем модель заголовка если его видимость зависит от наличия данных и текущее действие
        // это смена записей.
        // При headerVisibility === 'visible' вроде как пока не требуется перерисовывать заголовок, т.к.
        // он есть всегда. Но если потребуется, то нужно поправить это условие
        if (this._$headerVisibility === 'hasdata' && changeAction === IObservable.ACTION_RESET) {
            this._$headerModel = null;
        }

        this._$results = null;
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return this._itemsFactoryResolver.bind(this, superFactory);
    }

    protected _getGroupItemConstructor(): new() => GridGroupRow<T> {
        return GridGroupRow;
    }
    setEditing(editing: boolean): void {
        super.setEditing(editing);

        if (this._$headerModel && !this._headerIsVisible(this._$header)) {
            this._$headerModel = null;
        }
        this._nextVersion();
    }

    setExpandedItems(expandedKeys: CrudEntityKey[]): void {
        super.setExpandedItems(expandedKeys);
    }

    protected _removeItems(start: number, count?: number): T[] {
        const result = super._removeItems(start, count);

        if (this._$headerModel && !this._headerIsVisible(this._$header)) {
            this._$headerModel = null;
        }

        return result;
    }

    // endregion

    // region HasNodeWithChildren

    protected _setHasNodeWithChildren(hasNodeWithChildren: boolean): void {
        super._setHasNodeWithChildren(hasNodeWithChildren);
        if (this.getFooter()) {
            this.getFooter().setHasNodeWithChildren(hasNodeWithChildren);
        }
    }

    // endregion HasNodeWithChildren

    // region itemsFactoryResolver

    protected _itemsFactoryResolver(superFactory: ItemsFactory<T>, options?: ITreeGridRowOptions<S>): ItemsFactory<T> {
        options.columns = this._$columns;
        options.colspanCallback = this._$colspanCallback;
        options.columnSeparatorSize = this._$columnSeparatorSize;
        options.rowSeparatorSize = this._$rowSeparatorSize;

        // Строит обычную фабрику
        const CollectionItemsFactory = (factoryOptions?: ITreeGridRowOptions<S>): ItemsFactory<T> => {
            return superFactory.call(this, factoryOptions);
        };

        // Строит фабрику, которая работает с TreeGridGroupDataRow
        const GroupNodeFactory = (factoryOptions?: ITreeGridRowOptions<S>): ItemsFactory<T> => {
            factoryOptions.itemModule = 'Controls/treeGrid:TreeGridGroupDataRow';
            return superFactory.call(this, factoryOptions);
        };

        if (this._$nodeTypeProperty &&
            options.contents && typeof options.contents !== 'string' && !Array.isArray(options.contents) &&
            options.contents.get(this._$nodeTypeProperty) === 'group') {
            return GroupNodeFactory.call(this, options);
        }
        return CollectionItemsFactory.call(this, options);
    }

    // endregion itemsFactoryResolver

    protected _hasItemsToCreateResults(): boolean {
        return this.getChildrenByRecordSet(this.getRoot().getContents()).length > 1;
    }

    protected _initializeFooter(options: IOptions<S, T>): TreeGridFooterRow<S> {
        if (!options.footer && !options.footerTemplate) {
            return;
        }

        return new TreeGridFooterRow({
            ...options,
            owner: this,
            columns: options.footer,
            rowTemplate: options.footerTemplate,
            hasNodeWithChildren: this._hasNodeWithChildren
        });
    }

    // TODO по идее нужно это добавлять в Tree,
    //  но т.к. Tree используется в старой модели, чтобы ничего не сломать, добавляю здесь
    protected _createComposer(): itemsStrategy.Composer<any, TreeItem<any>> {
        const composer = super._createComposer();

        // TODO нужно определить когда точно нужна эта стратегия и добавлять только в этом случае
        composer.append(itemsStrategy.NodeFooter, {
            display: this,
            nodeFooterVisibilityCallback: this._$nodeFooterVisibilityCallback
        });

        return composer;
    }

    protected setMetaResults(metaResults: EntityModel) {
        super.setMetaResults(metaResults);
        this._$results?.setMetaResults(metaResults);
    }
}

Object.assign(TreeGridCollection.prototype, {
    '[Controls/treeGrid:TreeGridCollection]': true,
    _moduleName: 'Controls/treeGrid:TreeGridCollection',
    _itemModule: 'Controls/treeGrid:TreeGridDataRow',
    _$nodeTypeProperty: null
});
