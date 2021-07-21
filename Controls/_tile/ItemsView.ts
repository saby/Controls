import {ItemsView as BaseItemsView} from 'Controls/baseList';
import TileView from 'Controls/_tile/TileView';

/**
 * Контрол {@link /doc/platform/developmentapl/interface-development/controls/list/tile/ плиточного списка}, который умеет работать без {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}.
 * В качестве данных ожидает {@link Types/collection:RecordSet} переданный в опцию {@link Controls/list:IItemsView#items items}.
 *
 * @demo Controls-demo/tileNew/ItemsView/Base/Index
 * @implements Controls/list:IItemsView
 *
 * @class Controls/tile:ItemsView
 * @extends Controls/list:ItemsView
 * @implements Controls/list:IItemsView
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/interface/IGroupedList
 * @implements Controls/interface:IMultiSelectable
 * @implements Controls/list:IVirtualScrollConfig
 * @implements Controls/list:IList
 * @implements Controls/list:IClickableView
 * @implements Controls/marker:IMarkerList
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/tile:ITile
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
