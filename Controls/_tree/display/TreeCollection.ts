import { mixin } from 'Types/util';
import TreeItem, {IOptions as ITreeItemOptions} from './TreeItem';
import {
    Tree,
    CollectionItem,
    ItemsFactory,
    itemsStrategy,
    ITreeCollectionOptions
} from 'Controls/display';
import {Model} from 'Types/entity';
import {CrudEntityKey} from 'Types/source';

export interface IOptions<S extends Model, T extends TreeItem<S>>
   extends ITreeCollectionOptions<S, T> {
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

export default class TreeCollection<
    S extends Model,
    T extends TreeItem<S> = TreeItem<S>
> extends mixin<Tree<any>>(Tree) {
    readonly '[Controls/tree:TreeCollection]': boolean;

    constructor(options: IOptions<S, T>) {
        super(options);
        this._setupProjectionFilters();
    }

    protected _setupProjectionFilters(): void {
        this.addFilter(
            (contents, sourceIndex, item, collectionIndex) => itemIsVisible(item)
        );
    }

    // region override

    isLastItem(item: CollectionItem): boolean {
        // TODO Сделать возможным делать последний NodeFooter last, если он содержит данные
        //  Сейчас прямо в шаблоне проверяется как shouldDisplayVisibleFooter(content)
        //  Как можно проверить из кода - не ясно
        const enumerator = this._getUtilityEnumerator();

        // определяем через enumerator последнюю запись перед NodeFooter и её индекс
        enumerator.setPosition(this.getCount() - 1);
        let resultItemIndex = enumerator.getCurrentIndex();
        let resultItem = enumerator.getCurrent();
        while (resultItem && resultItem['[Controls/tree:TreeNodeFooterItem]']) {
            enumerator.movePrevious();
            resultItemIndex = enumerator.getCurrentIndex();
            resultItem = enumerator.getCurrent();
        }
        return resultItemIndex === this.getIndex(item);
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return this._itemsFactoryResolver.bind(this, superFactory);
    }

    setExpandedItems(expandedKeys: CrudEntityKey[]): void {
        super.setExpandedItems(expandedKeys);
    }

    // endregion

    // region HasNodeWithChildren

    protected _setHasNodeWithChildren(hasNodeWithChildren: boolean): void {
        super._setHasNodeWithChildren(hasNodeWithChildren);
        // todo myplan
        /*if (this.getFooter()) {
            this.getFooter().setHasNodeWithChildren(hasNodeWithChildren);
        }*/
    }

    // endregion HasNodeWithChildren

    // region itemsFactoryResolver

    protected _itemsFactoryResolver(superFactory: ItemsFactory<T>, options?: ITreeItemOptions<S>): ItemsFactory<T> {
        options.rowSeparatorSize = this._$rowSeparatorSize;
        return superFactory.call(this, options);
    }

    // endregion itemsFactoryResolver

    // TODO по идее нужно это добавлять в Tree,
    //  но т.к. Tree используется в старой модели, чтобы ничего не сломать, добавляю здесь
    protected _createComposer(): itemsStrategy.Composer<any, TreeItem<any>> {
        const composer = super._createComposer();

        // TODO нужно определить когда точно нужна эта стратегия и добавлять только в этом случае
        composer.append(itemsStrategy.NodeFooter, {
            display: this,
            itemModule: 'Controls/tree:TreeNodeFooterItem',
            nodeFooterVisibilityCallback: this._$nodeFooterVisibilityCallback
        });

        return composer;
    }
}

Object.assign(TreeCollection.prototype, {
    '[Controls/tree:TreeCollection]': true,
    _moduleName: 'Controls/tree:TreeCollection',
    _itemModule: 'Controls/tree:TreeItem'
});
