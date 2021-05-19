import {ItemsView as BaseItemsView} from 'Controls/list';
import TileView from 'Controls/_tile/TileView';

export default class ItemsView extends BaseItemsView {
    protected _viewName: Function = TileView;
    protected _viewModelConstructor: string = 'Controls/tile:TileCollection';

    static defaultProps: object = {
        ...BaseItemsView.defaultProps,
        actionAlignment: 'vertical',
        actionCaptionPosition: 'none'
    };
}
