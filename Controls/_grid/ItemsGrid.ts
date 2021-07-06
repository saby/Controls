import {isFullGridSupport} from 'Controls/display';
import * as GridView from 'Controls/_grid/GridView';
import GridViewTable from 'Controls/_grid/GridViewTable';
import {IItemsViewOptions, ItemsView as ListItemsView, ListControl as viewTemplate} from 'Controls/baseList';

/**
 * Контрол плоской таблицы, который умеет работать без источника данных.
 * В качестве данных ожидает {@link RecordSet} переданный в опцию {@link IItemsViewOptions.items}.
 * @mixes Controls/list:IItemsView
 * @demo Controls-demo/gridNew/ItemsView/Base/Index
 *
 * @public
 * @author Уфимцев Д.Ю.
 * @class Controls/grid:ItemsView
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
