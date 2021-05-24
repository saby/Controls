import {ITileItemActionsOptions, TileItemActions} from 'Controls/tile';

export default class TreeTileItemActions extends TileItemActions {
    protected _canShowActions: boolean = false;

    protected _beforeMount(options: ITileItemActionsOptions): void {
        super._beforeMount(options);
        this._canShowActions = this._item.isNode();
    }
}
