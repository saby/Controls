import {ListControl as viewTemplate, View as List} from 'Controls/list';
import GridViewModel = require('Controls/_grid/GridViewModel');
import viewName = require('Controls/_grid/GridView');


/**
    * Контрол «Таблица». Может загружать данные из источника данных.
    * Подробное описание и инструкции по настройке контрола можно найти <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/'>здесь</a>.
    * <a href="/materials/demo-ws4-edit-in-place">Демо-пример</a>.
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
    *
    * @mixes Controls/_list/BaseControlStyles
    * @mixes Controls/_list/ListStyles
    * @mixes Controls/_grid/GridStyles
    * @mixes Controls/_list/ItemActions/ItemActionsStyles
    * @mixes Controls/_list/Swipe/SwipeStyles
    *
    * @mixes Controls/MoveDialog/Styles
    * @mixes Controls/_paging/PagingStyles
    * @mixes Controls/_paging/DigitButtonsStyles
    * @mixes Controls/_grid/SortButtonStyles
    *
    * @control
    * @public
    * @author Авраменко А.С.
    * @category List
    * @demo Controls-demo/List/Grid/BasePG
    */

   /*
    * Table-looking list. Can load data from data source.
    * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/'>here</a>.
    * List of examples:
    * <ul>
    *    <li><a href="/materials/demo-ws4-edit-in-place">How to configure editing in your list</a>.</li>
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
    * @mixes Controls/interface/IGroupedGrid
    *
    * @mixes Controls/_list/BaseControlStyles
    * @mixes Controls/_list/ListStyles
    * @mixes Controls/_grid/GridStyles
    * @mixes Controls/_list/ItemActions/ItemActionsStyles
    * @mixes Controls/_list/Swipe/SwipeStyles
    *
    * @mixes Controls/MoveDialog/Styles
    * @mixes Controls/_paging/PagingStyles
    * @mixes Controls/_paging/DigitButtonsStyles
    * @mixes Controls/_grid/SortButtonStyles
    *
    * @control
    * @public
    * @author Авраменко А.С.
    * @category List
    * @demo Controls-demo/List/Grid/BasePG
    */

   var
      Grid = List.extend(/** @lends Controls/grid:View */{
         _viewName: viewName,
         _viewTemplate: viewTemplate,

         _getModelConstructor: function() {
            return GridViewModel;
         }
      });

   Grid.getDefaultOptions = function() {
      return {
         stickyHeader: true,
         stickyColumnsCount: 1,
         rowSeparatorSize: 's',
      };
   };

   export = Grid;
