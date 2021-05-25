import { ListControl as viewTemplate, View as List } from 'Controls/list';
import * as GridView from 'Controls/_grid/GridView';
import GridViewTable from 'Controls/_grid/GridViewTable';
import { isFullGridSupport } from 'Controls/display';
import { TemplateFunction } from 'UI/Base';

/**
 * Контрол «Таблица».
 * @class Controls/_grid/Grid
 * @mixes Controls/_grid/interface/IitemTemplateEditor
 * 
 * @public
 * @author Авраменко А.С.
 */

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
        return 'Controls/grid:GridCollection';
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
