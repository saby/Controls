import { ListControl as viewTemplate, View as List } from 'Controls/list';
import * as GridView from 'Controls/_gridNew/GridView';
import GridViewTable from 'Controls/_gridNew/GridViewTable';
import { isFullGridSupport } from 'Controls/display';
import { TemplateFunction } from 'UI/Base';

export default class Grid extends List {
    protected _viewName: TemplateFunction = null;
    protected _viewTemplate: TemplateFunction = viewTemplate;
    protected _supportNewModel: boolean = true;

    _beforeMount(options): Promise<void> {
        const superResult = super._beforeMount(options);
        this._viewName = isFullGridSupport() ? GridView : GridViewTable;
        return superResult;
    }

    protected _getModelConstructor(): string {
        return 'Controls/gridNew:GridCollection';
    }
}

Grid.getDefaultOptions = function() {
   return {
       stickyHeader: true,
       stickyColumnsCount: 1,
       rowSeparatorSize: null,
       columnSeparatorSize: null,
       isFullGridSupport: isFullGridSupport()
   };
};

Object.defineProperty(Grid, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Grid.getDefaultOptions();
   }
});
