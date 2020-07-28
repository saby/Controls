import {View as Grid} from 'Controls/grid';
import TreeGridViewModel = require('Controls/_treeGrid/TreeGridView/TreeGridViewModel');
import entity = require('Types/entity');
import TreeGridView = require('Controls/_treeGrid/TreeGridView/TreeGridView');
import { TreeControl } from 'Controls/tree';


/**
    * Иерархический список с пользовательским шаблоном элемента. Может загружать данные из источника данных.
    * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FGrid%2FEditableGrid">Демо-пример</a>.
    *
    * @class Controls/TreeGrid
    * @extends Controls/Grid
    * @mixes Controls/_interface/ISource
    * @mixes Controls/interface/IItemTemplate
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/_interface/INavigation
    * @mixes Controls/_interface/IFilterChanged
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/_list/interface/IList
    * @mixes Controls/_interface/IHierarchy
    * @mixes Controls/_tree/interface/ITreeControlOptions
    * @mixes Controls/interface/ITreeGridItemTemplate
    * @mixes Controls/interface/IDraggable
    *
    * @control
    * @private
    * @author Авраменко А.С.
    * @category List
    * @demo Controls-demo/List/TreeGrid/BasePG
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
    * @mixes Controls/interface/IItemTemplate
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IGroupedGrid
    * @mixes Controls/_interface/INavigation
    * @mixes Controls/_interface/IFilterChanged
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/_list/interface/IList
    * @mixes Controls/_interface/ISorting
    * @mixes Controls/_interface/IHierarchy
    * @mixes Controls/_tree/interface/ITreeControlOptions
    * @mixes Controls/interface/ITreeGridItemTemplate
    * @mixes Controls/interface/IDraggable
    *
    * @control
    * @private
    * @author Авраменко А.С.
    * @category List
    * @demo Controls-demo/List/TreeGrid/BasePG
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
         this._children.listControl.toggleExpanded(id);
      }
   });
   export = Tree;

