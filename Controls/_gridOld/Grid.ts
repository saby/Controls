import {ListControl as viewTemplate, View as List} from 'Controls/list';
import GridViewModel = require('Controls/_gridOld/GridViewModel');
import viewName = require('Controls/_gridOld/GridView');

export default class Grid extends List /** @lends Controls/grid:View */ {
    _viewName = viewName;
    _viewTemplate = viewTemplate;
    protected _supportNewModel: boolean = false;

    _getModelConstructor() {
        return GridViewModel;
    }
}

Grid.getDefaultOptions = function() {
   return {
       stickyHeader: true,
       stickyColumnsCount: 1,
       rowSeparatorSize: null,
       columnSeparatorSize: null
   };
};

Object.defineProperty(Grid, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Grid.getDefaultOptions();
   }
});
