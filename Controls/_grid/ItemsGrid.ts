import {isFullGridSupport} from 'Controls/display';
import * as GridView from 'Controls/_grid/GridView';
import GridViewTable from 'Controls/_grid/GridViewTable';
import {IItemsViewOptions, ItemsView as ListItemsView, ListControl as viewTemplate} from 'Controls/list';

/**
 * Контрол плоской таблицы, который умеет работать по {@link RecordSet}
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
