define('Controls/Grid', [
   'Controls/List',
   'Controls/List/Grid/GridViewModel',
   'Controls/List/Grid/GridView',
   'Controls/List/BaseControl'
], function(List, GridViewModel) {

   'use strict';

   /**
    * Table-looking list. Can load data from data source.
    * List of examples:
    * <ul>
    *    <li><a href="/materials/demo-ws4-edit-in-place">How to configure editing in your list</a>.</li>
    * </ul>
    *
    * @class Controls/Grid
    * @extends Controls/List
    * @mixes Controls/interface/ISource
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IGrouped
    * @mixes Controls/interface/INavigation
    * @mixes Controls/interface/IFilter
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/List/interface/IList
    * @mixes Controls/List/interface/IGridControl
    * @mixes Controls/interface/IGridItemTemplate
    * @mixes Controls/List/interface/IDraggable
    *
    * @mixes Controls/List/BaseControlStyles
    * @mixes Controls/List/ListStyles
    * @mixes Controls/List/Grid/GridStyles
    * @mixes Controls/List/ItemActions/ItemActionsStyles
    * @mixes Controls/List/Swipe/SwipeStyles
    *
    * @mixes Controls/List/Mover/MoveDialog/Styles
    * @mixes Controls/List/PagingStyles
    * @mixes Controls/List/DigitButtonsStyles
    * @mixes Controls/List/Grid/SortButtonStyles
    *
    * @cssModifier controls-Grid__cell_ellipsis With single-line content, cuts the text to the width of the cell, adding an ellipsis at the end
    *
    * @control
    * @public
    * @author Авраменко А.С.
    * @category List
    * @demo Controls-demo/List/Grid/BasePG
    */

   var
      Grid = List.extend(/** @lends Controls/Grid */{
         _viewName: 'Controls/List/Grid/GridView',
         _viewTemplate: 'Controls/List/ListControl',
         _getModelConstructor: function() {
            return GridViewModel;
         }
      });

   Grid.getDefaultOptions = function() {
      return {
         stickyHeader: true
      };
   };

   return Grid;
});
