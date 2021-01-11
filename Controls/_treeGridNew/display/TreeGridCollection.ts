import { mixin } from 'Types/util';
import TreeGridDataRow, {IOptions as ITreeGridRowOptions} from './TreeGridDataRow';
import {
    TreeItem,
    GridGroupItem,
    GridMixin,
    Tree,
    GridLadderUtil,
    ItemsFactory,
    itemsStrategy,
    IGridCollectionOptions,
    ITreeCollectionOptions
} from 'Controls/display';
import TreeGridFooterRow from './TreeGridFooterRow';
import { Model } from 'Types/entity';
import TreeGridNodeFooterRow from './TreeGridNodeFooterRow';

export interface IOptions<S extends Model, T extends TreeGridDataRow<S>>
   extends IGridCollectionOptions<S, T>, ITreeCollectionOptions<S, T> {}

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

    constructor(options: IOptions<S, T>) {
        super(options);
        GridMixin.call(this, options);

        // TODO должно быть в Tree. Перенести туда, когда полностью перейдем на новую коллекцию TreeGrid.
        //  Если сразу в Tree положим, то все разломаем
        this.addFilter(
            (contents, sourceIndex, item, collectionIndex) => itemIsVisible(item)
        );
    }

    // TODO duplicate code with GridCollection. Нужно придумать как от него избавиться.
    //  Проблема в том, что mixin не умеет объединять одинаковые методы, а логику Grid мы добавляем через mixin
    // region override

    setMultiSelectVisibility(visibility: string): void {
        super.setMultiSelectVisibility(visibility);
        this._$colgroup?.reBuild();
    }

    setHasMoreData(hasMoreData: boolean): void {
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
        this._updateItemsColumns();
    }

    protected _handleAfterCollectionChange(): void {
        super._handleAfterCollectionChange();
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties)) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
            this._updateItemsLadder();
        }
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?: ITreeGridRowOptions<T>): T {
            options.columns = this._$columns;
            options.colspanCallback = this._$colspanCallback;
            options.columnSeparatorSize = this._$columnSeparatorSize;
            options.rowSeparatorSize = this._$rowSeparatorSize;
            return superFactory.call(this, options);
        };
    }

    protected _getGroupItemConstructor(): new() => GridGroupItem<T> {
        return GridGroupItem;
    }

    // endregion

    protected _initializeFooter(options: IOptions<S, T>): TreeGridFooterRow<S> {
        return new TreeGridFooterRow({
            ...options,
            owner: this,
            footer: options.footer,
            footerTemplate: options.footerTemplate
        });
    }

    // TODO по идее нужно это добавлять в Tree,
    //  но т.к. Tree используется в старой модели, чтобы ничего не сломать, добавляю здесь
    protected _createComposer(): itemsStrategy.Composer<any, TreeItem<any>> {
        const composer = super._createComposer();

        // TODO нужно определить когда точно нужна эта стратегия и добавлять только в этом случае
        composer.append(itemsStrategy.NodeFooter, {
            display: this,
            footerVisibilityCallback: this._$footerVisibilityCallback,
            nodeFooterConstructor: TreeGridNodeFooterRow
        });

        return composer;
    }
}

Object.assign(TreeGridCollection.prototype, {
    '[Controls/treeGrid:TreeGridCollection]': true,
    _moduleName: 'Controls/treeGrid:TreeGridCollection',
    _itemModule: 'Controls/treeGrid:TreeGridDataRow'
});
