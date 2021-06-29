import {ItemsView as BaseItemsView} from 'Controls/list';
import TileView from 'Controls/_tile/TileView';

/**
 * Контрол плиточного списка, который умеет работать без источника данных.
 * В качестве данных ожидает {@link Types/collection:RecordSet} переданный в опцию
 * {@link Controls/_list/IItemsView#items}.
 *
 * @demo Controls-demo/tileNew/ItemsView/Base/Index
 * @mixes Controls/list:IItemsView
 *
 * @class Controls/tile:ItemsView
 * @extends Controls/list:ItemsView
 * @mixes Controls/list:IItemsView
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/list:IVirtualScrollConfig
 * @mixes Controls/list:IList
 * @mixes Controls/list:IClickableView
 * @mixes Controls/marker:IMarkerList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/tile:ITile
 *
 * @public
 * @author Уфимцев Д.Ю.
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
