import {View as Grid} from 'Controls/grid';
import TreeGridViewModel = require('Controls/_treeGrid/TreeGridView/TreeGridViewModel');
import entity = require('Types/entity');
import TreeGridView = require('Controls/_treeGrid/TreeGridView/TreeGridView');
import { TreeControl } from 'Controls/tree';
import {CrudEntityKey} from 'Types/source';
import { Model } from 'Types/entity';

   /**
    * Контрол "Дерево".
    * @remark
    * Дополнительно о контроле:
    * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree/ руководство разработчика}
    * * {@link http://axure.tensor.ru/standarts/v7/%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE__%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F_1_.html Спецификация Axure}
    * * {@link /materials/Controls-demo/app/Controls-demo%2FList%2FTree%2FSingleExpand демо-пример с множественным выбором элементов и с единичным раскрытием содержимого папок}
    * * {@link /materials/Controls-demo/app/Controls-demo%2FList%2FTree%2FTreeWithPhoto демо-пример с пользовательским шаблоном элемента списка с фото}
    * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_treeGrid.less переменные тем оформления treeGred}
    * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less переменные тем оформления list}
    *
    * @class Controls/_treeGrid/View
    * @extends Controls/_grid/Grid
    * @mixes Controls/_interface/ISource
    * @mixes Controls/_list/interface/IClickableView
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
    * @mixes Controls/_grid/interface/IGridControl
    * @mixes Controls/_grid/interface/IPropStorage
    * @mixes Controls/_treeGrid/interface/IReloadableTreeGrid
    *
    * @mixes Controls/_list/interface/IVirtualScrollConfig
    *
    * 
    * @public
    * @author Авраменко А.С.
    * @demo Controls-demo/treeGrid/Base/TreeView/Index
    */

   /*
    * Hierarchical list with custom item template. Can load data from data source.
    * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/'>here</a>.
    * The detailed description and instructions on how to configure editing you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/edit-at-list/'>here</a>.
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
    * @mixes Controls/_itemActions/interface/IItemActionsOptions
    * @mixes Controls/_interface/ISorting
    * @mixes Controls/_interface/IHierarchy
    * @implements Controls/_tree/interface/ITreeControl
    * @mixes Controls/interface/ITreeGridItemTemplate
    * @mixes Controls/_interface/IDraggable
    * @mixes Controls/_grid/interface/IGridControl
    * @mixes Controls/_grid/interface/IPropStorage
    * @mixes Controls/_list/interface/IVirtualScrollConfig
    * @mixes Controls/_treeGrid/interface/IReloadableTreeGrid
    *
    * 
    * @public
    * @author Авраменко А.С.
    * @demo Controls-demo/treeGrid/Base/TreeGridView/Index
    */

export default class Tree extends Grid/** @lends Controls/TreeGrid */ {
   _viewName = TreeGridView;
   _viewTemplate = TreeControl;
   protected _supportNewModel: boolean = false;

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

   /**
    * Возвращает следующую запись в проекции дерева.
    * @function Controls/_treeGrid/View#getNextItem
    * @param {String|Number} key Ключ записи, относительно которой нужно найти следующую запись.
    * @return {Model} Следующая запись.
    */
   getNextItem(key: CrudEntityKey): Model {
      return this._children.listControl.getNextItem(key);
   }

   /**
    * Возвращает предыдущую запись в проекции дерева.
    * @function Controls/_treeGrid/View#getPrevItem
    * @param {String|Number} key Ключ записи, относительно которой нужно найти предыдущую запись.
    * @return {Model} Предыдущая запись.
    */
   getPrevItem(key: CrudEntityKey): Model {
      return this._children.listControl.getPrevItem(key);
   }
}
/**
 * @typedef {String} Position
 * @variant default Стандартное расположение иконки узла.
 * @variant right Расположение иконки узла справа.
 * @variant custom Произвольное расположение иконки узла. При данном значении опции, шаблон иконки передается в прикладной шаблон и может быть выведен в любом месте записи.
 */
/**
 * @name Controls/_treeGrid/View#expanderPosition
 * @cfg {Position} Расположение иконки для узла и скрытого узла.
 * @remark
 * Чтобы разместить иконку узла в произвольном месте пользовательского шаблона, сделайте следующее:
 * 
 * 1. Опцию **expanderPosition** установите в значение "custom".
 * 2. В пользовательском шаблоне отображения элемента в опции contentTemplate укажите позицию для отображения иконки узла. Для этого поместите директиву {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial} и в качестве встраиваемого шаблона укажите **expanderTemplate**.
 * 
 * Пример этого функционала показан в первом демо-примере.
 * @default default
 * @demo Controls-demo/treeGrid/Expander/ExpanderPosition/Custom/Index В следующем примере для контрола опция expanderPosition установлена в значение custom.
 * @demo Controls-demo/treeGrid/Expander/ExpanderPosition/Right/Index В следующем примере для контрола опция expanderPosition установлена в значение right.
 * @demo Controls-demo/treeGrid/Expander/ExpanderPosition/RightWithColumnTemplate/Index В следующем примере для контрола опция expanderPosition установлена в значение right, а также задан шаблон отображения колонки.
 * @markdown
 */
/**
 * @name Controls/_treeGrid/View#root
 * @cfg {Number|String} Идентификатор корневого узла.
 */