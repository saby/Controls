import {View as Grid} from 'Controls/grid';
import TreeGridViewModel = require('Controls/_treeGrid/TreeGridView/TreeGridViewModel');
import entity = require('Types/entity');
import TreeGridView = require('Controls/_treeGrid/TreeGridView/TreeGridView');
import { TreeControl } from 'Controls/tree';


/**
    * Контрол "Дерево".
    * @remark
    * Дополнительно о контроле:
    * * <a href="/doc/platform/developmentapl/interface-development/controls/list/tree/">Руководство разработчика</a>
    * * <a href="http://axure.tensor.ru/standarts/v7/%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE__%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F_1_.html">Спецификация Axure</a>
    * * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTree%2FSingleExpand">Демо-пример</a> с множественным выбором элементов и с единичным раскрытием содержимого папок
    * * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FItemTemplatePG">Демо-пример</a> с пользовательским шаблоном элемента списка
    * * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTree%2FTreeWithPhoto">Демо-пример</a> с пользовательским шаблоном элемента списка с фото
    * * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FExtendedPG">Демо-пример</a> с пользовательским шаблоном подвала (футера)
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_treeGrid.less">переменные тем оформления treeGred</a>
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления list</a>
    *
    * @class Controls/_treeGrid/View
    * @extends Controls/_grid/Grid
    * @mixes Controls/_interface/ISource
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
    * @mixes Controls/_grid/interface/IGridControl
    * @mixes Controls/_grid/interface/IPropStorage
    * @mixes Controls/_treeGrid/interface/IReloadableTreeGrid
    *
    * @mixes Controls/_list/interface/IVirtualScroll
    *
    * @control
    * @public
    * @author Авраменко А.С.
    * @category List
    * @demo Controls-demo/treeGrid/Base/TreeView/Index
    */

   /*
    * Hierarchical list with custom item template. Can load data from data source.
    * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/'>here</a>.
    * The detailed description and instructions on how to configure editing you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/edit-at-list/'>here</a>.
    * List of examples:
    * <ul>
    *    <li><a href="/materials/Controls-demo/app/Controls-demo%2FList%2FGrid%2FEditableGrid">How to configure editing in your list</a>.</li>
    *    <li><a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTree%2FSingleExpand">Tree with singleExpand option</a>.</li>
    * </ul>
    *
    * @class Controls/_treeGrid/View
    * @extends Controls/_grid/Grid
    * @mixes Controls/_interface/ISource
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
    * @mixes Controls/_grid/interface/IGridControl
    * @mixes Controls/_grid/interface/IPropStorage
    * @mixes Controls/_list/interface/IVirtualScroll
    * @mixes Controls/_treeGrid/interface/IReloadableTreeGrid
    *
    * @control
    * @public
    * @author Авраменко А.С.
    * @category List
    * @demo Controls-demo/List/TreeGrid/BasePG
    */

export default class Tree extends Grid/** @lends Controls/TreeGrid */ {
   _viewName = TreeGridView;
   _viewTemplate = TreeControl;

   _getModelConstructor() {
      return TreeGridViewModel;
   }

   getOptionTypes() {
      return {
         keyProperty: entity.descriptor(String).required(),
         parentProperty: entity.descriptor(String).required()
      };
   }

   // todo removed or documented by task:
   // https://online.sbis.ru/opendoc.html?guid=24d045ac-851f-40ad-b2ba-ef7f6b0566ac
   toggleExpanded(id) {
      this._children.listControl.toggleExpanded(id);
   }
}
