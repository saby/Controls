import { View as List } from 'Controls/list';
import viewName = require('Controls/_gridNew/GridView');
import viewTemplate from './GridControl';

export default class Grid extends List {
    _viewName = viewName;
    _viewTemplate = viewTemplate;
    protected _supportNewModel: boolean = true;

    _getModelConstructor() {
        return 'Controls/display:GridCollection';
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
