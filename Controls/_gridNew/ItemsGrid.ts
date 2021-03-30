import {isFullGridSupport} from 'Controls/display';
import * as GridView from 'Controls/_gridNew/GridView';
import GridViewTable from 'Controls/_gridNew/GridViewTable';
import {IItemsViewOptions, ItemsView as ListItemsView, ListControl as viewTemplate} from 'Controls/list';

/**
 * Контрол плоской таблицы, который умеет работать по {@link RecordSet}
 * @author Уфимцев Д.Ю.
 */
export default class ItemsGrid<TOptions extends IItemsViewOptions> extends ListItemsView<TOptions> {
    //region override base template props
    protected _viewName: Function = null;
    protected _viewTemplate: Function = viewTemplate;
    protected _viewModelConstructor: string = 'Controls/gridNew:GridCollection';
    //endregion

    _beforeMount(options: TOptions): void | Promise<void> {
        const superResult = super._beforeMount(options);
        this._viewName = isFullGridSupport() ? GridView : GridViewTable;
        return superResult;
    }
}
