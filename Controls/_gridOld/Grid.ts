import {ListControl as viewTemplate, View as List} from 'Controls/list';
import GridViewModel = require('Controls/_gridOld/GridViewModel');
import viewName = require('Controls/_gridOld/GridView');

/**
 * Контрол "Таблица" позволяет отображать данные из различных источников в виде таблицы.
 * Контрол поддерживает широкий набор возможностей, позволяющих разработчику максимально гибко настраивать отображение данных.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_grid.less переменные тем оформления grid}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_list.less переменные тем оформления list}
 *
 * @class Controls/_gridOld/Grid
 * @extends Controls/list:View
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/_interface/grid/IGridControl
 * @mixes Controls/interface/IGridItemTemplate
 * @mixes Controls/_interface/IDraggable
 * @mixes Controls/interface/IGroupedGrid
 * @mixes Controls/interface/IGridItemTemplate
 * @mixes Controls/_gridOld/interface/IPropStorage
 * @mixes Controls/_marker/interface/IMarkerList
 *
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/grid/Base/Index
 */

/*
 * Table-looking list. Can load data from data source.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/'>here</a>.
 * List of examples:
 * <ul>
 *    <li><a href="/materials/Controls-demo/app/Controls-demo%2FList%2FGrid%2FEditableGrid">How to configure editing in your list</a>.</li>
 * </ul>
 *
 * @class Controls/_gridOld/Grid
 * @extends Controls/list:View
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedGrid
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_interface/grid/IGridControl
 * @mixes Controls/interface/IGridItemTemplate
 * @mixes Controls/_interface/IDraggable
 * @mixes Controls/_gridOld/interface/IPropStorage
 * @mixes Controls/_marker/interface/IMarkerList
 *
 *
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/grid/Base/Index
 */

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
