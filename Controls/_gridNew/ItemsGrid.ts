import {isFullGridSupport} from 'Controls/display';
import * as GridView from 'Controls/_gridNew/GridView';
import GridViewTable from 'Controls/_gridNew/GridViewTable';
import {IItemsViewOptions, ItemsView, ListControl as viewTemplate} from 'Controls/list';

export default class ItemsGrid extends ItemsView {
    protected _viewName: Function = null;
    protected _viewTemplate: Function = viewTemplate;
    protected _viewModelConstructor: string = 'Controls/gridNew:GridCollection';

    _beforeMount(options: IItemsViewOptions): void | Promise<void> {
        const superResult = super._beforeMount(options);
        this._viewName = isFullGridSupport() ? GridView : GridViewTable;
        return superResult;
    }
}
