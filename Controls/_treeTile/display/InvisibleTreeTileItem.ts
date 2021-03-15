import { TreeItem } from 'Controls/display';
import {InvisibleTileItem} from 'Controls/tileNew';

export default class InvisibleTreeTileItem extends InvisibleTileItem {
    protected _$node: boolean|null;

    protected _$parent: TreeItem;

    protected _$folderWidth: number;

    isNode(): boolean|null {
        return this._$node;
    }

    setNode(node: boolean|null): void {
        if (this._$node !== node) {
            this._$node = node;
            this._nextVersion();
        }
    }

    getFolderWidth(): number {
        return this._$folderWidth;
    }

    setFolderWidth(folderWidth: number): void {
        if (this._$folderWidth !== folderWidth) {
            this._$folderWidth = folderWidth;
            this._nextVersion();
        }
    }

    getTileWidth(): number {
        if (this.isNode()) {
            return this.getFolderWidth() || super.getTileWidth();
        } else {
            return super.getTileWidth();
        }
    }

    getParent(): TreeItem {
        return this._$parent;
    }
}

Object.assign(InvisibleTreeTileItem.prototype, {
    '[Controls/_treeTile/InvisibleTreeTileItem]': true,
    _moduleName: 'Controls/treeTile:InvisibleTreeTileItem',
    _instancePrefix: 'invisible-tree-tile-item-',
    _$folderWidth: null,
    _$node: null,
    _$parent: null
});
