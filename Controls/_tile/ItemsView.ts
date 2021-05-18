import {ItemsView as BaseItemsView} from 'Controls/list';
import TileView from 'Controls/_tile/TileView';

export default class ItemsView extends BaseItemsView {
    protected _viewName: Function = TileView;
    protected _viewModelConstructor: string = 'Controls/tile:TileCollection';

    static getDefaultOptions(): object {
        return {
            actionAlignment: 'vertical',
            actionCaptionPosition: 'none'
        };
    }
}

Object.defineProperty(ItemsView, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return ItemsView.getDefaultOptions();
    }
});
