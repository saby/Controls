import {isFullGridSupport} from 'Controls/display';
import * as GridView from 'Controls/_grid/GridView';
import GridViewTable from 'Controls/_grid/GridViewTable';
import {IItemsViewOptions, ItemsView as ListItemsView, ListControl as viewTemplate} from 'Controls/baseList';

/**
 * Контрол плоской {@link /doc/platform/developmentapl/interface-development/controls/list/grid/ таблицы}, который умеет работать без {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}.
 * В качестве данных ожидает {@link Types/collection:RecordSet} переданный в опцию {@link Controls/list:IItemsView#items items}.
 *
 * @demo Controls-demo/gridNew/ItemsView/Base/Index
 *
 * @class Controls/grid:ItemsView
 * @extends Controls/list:ItemsView
 * @implements Controls/list:IItemsView
 * @implements Controls/list:IVirtualScrollConfig
 * @implements Controls/list:IList
 * @implements Controls/list:IClickableView
 * @implements Controls/interface/IGridItemTemplate
 * @implements Controls/interface/IGroupedGrid
 * @implements Controls/interface/IGridItemTemplate
 * @implements Controls/interface/IGroupedList
 * @implements Controls/interface:IMultiSelectable
 * @implements Controls/grid:IGridControl
 * @implements Controls/marker:IMarkerList
 * @implements Controls/itemActions:IItemActions
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export default class ItemsGrid<TOptions extends IItemsViewOptions = IItemsViewOptions> extends ListItemsView<TOptions> {
    //region override base template props
    protected _viewName: Function = null;
    protected _viewTemplate: Function = viewTemplate;
    protected _viewModelConstructor: string = 'Controls/grid:GridCollection';
    //endregion

    _beforeMount(options: TOptions): void | Promise<void> {
        const superResult = super._beforeMount(options);
        this._viewName = isFullGridSupport() ? GridView : GridViewTable;
        return superResult;
    }
}
