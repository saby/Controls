import {View as Grid} from 'Controls/gridOld';
import TreeGridViewModel = require('Controls/_treeGridOld/TreeGridView/TreeGridViewModel');
import entity = require('Types/entity');
import TreeGridView = require('Controls/_treeGridOld/TreeGridView/TreeGridView');
import { TreeControl } from 'Controls/tree';
import 'css!Controls/grid';
import 'css!Controls/treeGrid';


/**
    * Иерархический список с пользовательским шаблоном элемента. Может загружать данные из источника данных.
    * {@link /materials/Controls-demo/app/Controls-demo%2FList%2FGrid%2FEditableGrid демо-пример}.
    *
    * @class Controls/TreeGrid
    * @extends Controls/Grid
    * @mixes Controls/interface:ISource
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/interface:INavigation
    * @mixes Controls/interface:IFilterChanged
    * @mixes Controls/list:IList
    * @mixes Controls/itemActions:IItemActions
    * @mixes Controls/interface:IHierarchy
    * @implements Controls/_tree/interface/ITreeControl
    * @mixes Controls/interface/ITreeGridItemTemplate
    * @mixes Controls/interface:IDraggable
    * @mixes Controls/marker:IMarkerList
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
    * @mixes Controls/interface:ISource
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/interface:INavigation
    * @mixes Controls/interface:IFilterChanged
    * @mixes Controls/list:IList
    * @mixes Controls/itemActions:IItemActions
    * @mixes Controls/interface:ISorting
    * @mixes Controls/interface:IHierarchy
    * @implements Controls/_tree/interface/ITreeControl
    * @mixes Controls/interface/ITreeGridItemTemplate
    * @mixes Controls/interface:IDraggable
    * @mixes Controls/marker:IMarkerList
    *
    *
    * @private
    * @author Авраменко А.С.
    */

   var Tree = Grid.extend(/** @lends Controls/TreeGrid */{
      _viewName: TreeGridView,
      _viewTemplate: TreeControl,

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
         this._children.listControl.toggleExpanded(id);
      }
   });
   export = Tree;

