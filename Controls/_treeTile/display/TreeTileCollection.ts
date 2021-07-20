import {Model} from 'Types/entity';
import { mixin } from 'Types/util';
import {ITileCollectionOptions, TileMixin} from 'Controls/tile';
import TreeTileCollectionItem, {ITreeTileCollectionItemOptions} from './TreeTileCollectionItem';
import {ItemsFactory, itemsStrategy, ITreeOptions, Tree, TreeItem} from 'Controls/display';
import InvisibleStrategy from './strategy/Invisible';
import TileCollectionItem from "Controls/_tile/display/TileCollectionItem";

/**
 * Рекурсивно проверяет скрыт ли элемент сворачиванием родительских узлов
 * @param {TreeItem} item
 */
function itemIsVisible(item: TreeItem): boolean  {
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

export interface ITreeTileCollectionOptions<
    S extends Model = Model,
    T extends TreeTileCollectionItem<S> = TreeTileCollectionItem<S>
> extends ITreeOptions<S, T>, ITileCollectionOptions<S, T>, ITreeTileAspectOptions {}

export interface ITreeTileAspectOptions {
    nodesHeight: number;
    folderWidth: number;
}

export default class TreeTileCollection<
    S extends Model = Model,
    T extends TreeTileCollectionItem = TreeTileCollectionItem
> extends mixin<Tree, TileMixin>(Tree, TileMixin) {
    protected _$nodesHeight: number;

    protected _$folderWidth: number;

    readonly SupportExpand: boolean = false;

    constructor(options: ITreeTileCollectionOptions<S, T>) {
        super(options);

        // TODO должно быть в Tree. Перенести туда, когда полностью перейдем на новые коллекции.
        //  Если сразу в Tree положим, то все разломаем
        this.addFilter(
            (contents, sourceIndex, item) => itemIsVisible(item)
        );
    }

    setActiveItem(item: T): void {
        if (!item) {
            this.setHoveredItem(null);
        }
        super.setActiveItem(item);
    }

    getNodesHeight(): number {
        return this._$nodesHeight;
    }

    setNodesHeight(nodesHeight: number): void {
        if (this._$nodesHeight !== nodesHeight) {
            this._$nodesHeight = nodesHeight;
            this._updateItemsProperty(
                'setNodesHeight', this._$nodesHeight, 'setNodesHeight'
            );
            this._nextVersion();
        }
    }

    getFolderWidth(): number {
        return this._$folderWidth;
    }

    setFolderWidth(folderWidth: number): void {
        if (this._$folderWidth !== folderWidth) {
            this._$folderWidth = folderWidth;
            this._updateItemsProperty(
                'setFolderWidth', this._$folderWidth, 'setFolderWidth'
            );
            this._nextVersion();
        }
    }

    getExpanderIcon(): string {
        return 'none';
    }

    protected _getChildrenArray(parent: T, withFilter?: boolean): T[] {
        // фильтруем невидимые элементы, т.к. они нужны только для отрисовки, обрабатывать их никак не нужно
        const childrenArray = super._getChildrenArray(parent, withFilter);
        return childrenArray.filter((it) => !it['[Controls/_tile/display/mixins/InvisibleItem]']) as T[];
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const parent = super._getItemsFactory();

        return function TileItemsFactory(options: ITreeTileCollectionItemOptions): T {
            const params = this._getItemsFactoryParams(options);
            return parent.call(this, params);
        };
    }

    protected _getItemsFactoryParams(params: any): any {
        super._getItemsFactoryParams(params);

        params.nodesHeight = this.getNodesHeight();
        params.folderWidth = this.getFolderWidth();
        return params;
    }

    protected _createComposer(): itemsStrategy.Composer<S, TreeItem<Model>> {
        const composer = super._createComposer();

        composer.append(InvisibleStrategy, {
            display: this
        });

        return composer;
    }
}

Object.assign(TreeTileCollection.prototype, {
    '[Controls/_treeTile/TreeTileCollection]': true,
    _moduleName: 'Controls/treeTile:TreeTileCollection',
    _itemModule: 'Controls/treeTile:TreeTileCollectionItem',
    _$nodesHeight: null,
    _$folderWidth: null
});
