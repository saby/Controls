import {ItemsView as BaseItemsView} from 'Controls/list';
import TileView from 'Controls/_tileNew/TileView';

export default class ItemsView extends BaseItemsView {
    protected _viewName: Function = TileView;
    protected _viewModelConstructor: string = 'Controls/tileNew:TileCollection';
}
