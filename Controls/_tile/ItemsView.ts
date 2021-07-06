import {ItemsView as BaseItemsView} from 'Controls/baseList';
import TileView from 'Controls/_tile/TileView';

/**
 * Контрол плиточного списка, который умеет работать без источника данных.
 * В качестве данных ожидает {@link RecordSet} переданный в опцию {@link IItemsViewOptions.items}.
 *
 * @demo Controls-demo/tileNew/ItemsView/Base/Index
 * @mixes Controls/list:IItemsView
 * @public
 * @author Уфимцев Д.Ю.
 * @class Controls/tile:ItemsView
 */
export default class ItemsView extends BaseItemsView {
    protected _viewName: Function = TileView;
    protected _viewModelConstructor: string = 'Controls/tile:TileCollection';

    static defaultProps: object = {
        ...BaseItemsView.defaultProps,
        actionAlignment: 'vertical',
        actionCaptionPosition: 'none'
    };
}
