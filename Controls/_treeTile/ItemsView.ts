import { ItemsView as BaseItemsView } from 'Controls/tile';
import {TreeControl} from 'Controls/tree';
import TreeTileView from 'Controls/_treeTile/TreeTileView';

export default class ItemsView extends BaseItemsView {
    protected _viewName: Function = TreeTileView;
    protected _viewTemplate: Function = TreeControl;
    protected _viewModelConstructor: string = 'Controls/treeTile:TreeTileCollection';
}
