import {View as Grid} from 'Controls/grid';
import TreeGridViewModel = require('Controls/_treeGrid/TreeGridView/TreeGridViewModel');
import entity = require('Types/entity');
import TreeGridView = require('Controls/_treeGrid/TreeGridView/TreeGridView');
import { TreeControl } from 'Controls/tree';


/**
    * Иерархический список с пользовательским шаблоном элемента. Может загружать данные из источника данных.
    * {@link /materials/Controls-demo/app/Controls-demo%2FList%2FGrid%2FEditableGrid демо-пример}.
    *
    * @class Controls/TreeGrid
    * @extends Controls/Grid
    * @mixes Controls/_interface/ISource
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/_interface/INavigation
    * @mixes Controls/_interface/IFilterChanged
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/_list/interface/IList
    * @mixes Controls/_itemActions/interface/IItemActionsOptions
    * @mixes Controls/_interface/IHierarchy
    * @implements Controls/_tree/interface/ITreeControl
    * @mixes Controls/interface/ITreeGridItemTemplate
    * @mixes Controls/_interface/IDraggable
    * @mixes Controls/_marker/interface/IMarkerList
    *
    *
    * @private
    * @author Авраменко А.С.
    */

   /*
    * Hierarchical list with custom item template. Can load data from data source.
    * List of examples:
    * <ul>
    *    <li><a href="/materials/Controls-demo/app/Controls-demo%2FList%2FGrid%2FEditableGrid">How to configure editing in your list</a>.</li>
    * </ul>
    *
    * @class Controls/TreeGrid
    * @extends Controls/Grid
    * @mixes Controls/_interface/ISource
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/_interface/INavigation
    * @mixes Controls/_interface/IFilterChanged
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/_list/interface/IList
    * @mixes Controls/_itemActions/interface/IItemActionsOptions
    * @mixes Controls/_interface/ISorting
    * @mixes Controls/_interface/IHierarchy
    * @implements Controls/_tree/interface/ITreeControl
    * @mixes Controls/interface/ITreeGridItemTemplate
    * @mixes Controls/_interface/IDraggable
    * @mixes Controls/_marker/interface/IMarkerList
    *
    *
    * @private
    * @author Авраменко А.С.
    */

   var Tree = Grid.extend(/** @lends Controls/TreeGrid */{
      _viewName: TreeGridView,
      _viewTemplate: TreeControl,
      _theme: ['Controls/treeGrid', 'Controls/grid'],

      _getModelConstructor: function() {
         return TreeGridViewModel;
      },
      getOptionTypes: function() {
         return {
            keyProperty: entity.descriptor(String).required(),
            parentProperty: entity.descriptor(String).required()
         };
      },
      toggleExpanded: function(id) {
         return this._children.listControl.toggleExpanded(id);
      }
   });
   export = Tree;

