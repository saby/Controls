import {ListControl as viewTemplate, View as List} from 'Controls/list';
import GridViewModel = require('Controls/_grid/GridViewModel');
import viewName = require('Controls/_grid/GridView');

   /**
    * Контрол «Таблица». Может загружать данные из источника данных.
    * 
    * @remark
    * Полезные ссылки:
    * * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FGrid%2FEditableGrid">демо-пример</a>
    * * <a href="/doc/platform/developmentapl/interface-development/controls/list/">руководство разработчика</a>
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_grid.less">переменные тем оформления grid</a>
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления list</a>
    * 
    * @class Controls/_grid/Grid
    * @extends Controls/list:View
    * @mixes Controls/_interface/ISource
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/_interface/INavigation
    * @mixes Controls/_interface/IFilter
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/_list/interface/IList
    * @mixes Controls/_grid/interface/IGridControl
    * @mixes Controls/interface/IGridItemTemplate
    * @mixes Controls/interface/IDraggable
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/interface/IGridItemTemplate
    * @mixes Controls/_grid/interface/IPropStorage
    *
    * @control
    * @public
    * @author Авраменко А.С.
    * @category List
    * @demo Controls-demo/grid/Base/Index
    */

   /*
    * Table-looking list. Can load data from data source.
    * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/'>here</a>.
    * List of examples:
    * <ul>
    *    <li><a href="/materials/Controls-demo/app/Controls-demo%2FList%2FGrid%2FEditableGrid">How to configure editing in your list</a>.</li>
    * </ul>
    *
    * @class Controls/_grid/Grid
    * @extends Controls/list:View
    * @mixes Controls/_interface/ISource
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/_interface/INavigation
    * @mixes Controls/_interface/IFilter
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/_list/interface/IList
    * @mixes Controls/_interface/ISorting
    * @mixes Controls/_grid/interface/IGridControl
    * @mixes Controls/interface/IGridItemTemplate
    * @mixes Controls/interface/IDraggable
    * @mixes Controls/_grid/interface/IPropStorage
    *
    * @control
    * @public
    * @author Авраменко А.С.
    * @category List
    * @demo Controls-demo/List/Grid/BasePG
    */

export default class Grid extends List /** @lends Controls/grid:View */ {
    _viewName = viewName;
    _viewTemplate = viewTemplate;

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
