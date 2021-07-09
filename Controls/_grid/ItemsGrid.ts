import {isFullGridSupport} from 'Controls/display';
import * as GridView from 'Controls/_grid/GridView';
import GridViewTable from 'Controls/_grid/GridViewTable';
import {IItemsViewOptions, ItemsView as ListItemsView, ListControl as viewTemplate} from 'Controls/baseList';

/**
 * Контрол плоской таблицы, который умеет работать без источника данных.
 * В качестве данных ожидает {@link Types/collection:RecordSet} переданный в опцию
 * {@link Controls/_list/IItemsView#items}.
 *
 * @demo Controls-demo/gridNew/ItemsView/Base/Index
 *
 * @class Controls/grid:ItemsView
 * @extends Controls/list:ItemsView
 * @mixes Controls/list:IItemsView
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/list:IVirtualScrollConfig
 * @mixes Controls/list:IList
 * @mixes Controls/list:IClickableView
 * @mixes Controls/marker:IMarkerList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/grid:IGridControl
 * @mixes Controls/interface/IGridItemTemplate
 * @mixes Controls/interface/IGroupedGrid
 * @mixes Controls/interface/IGridItemTemplate
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
