import {View as Grid} from 'Controls/gridOld';
import TreeGridViewModel = require('Controls/_treeGridOld/TreeGridView/TreeGridViewModel');
import entity = require('Types/entity');
import TreeGridView = require('Controls/_treeGridOld/TreeGridView/TreeGridView');
import { TreeControl } from 'Controls/tree';
import {CrudEntityKey} from 'Types/source';
import { Model } from 'Types/entity';

/**
 * Контрол "Дерево" позволяет отображать данные из различных источников в виде иерархического списка.
 * Контрол поддерживает широкий набор возможностей, позволяющих разработчику максимально гибко настраивать отображение данных.
 * @remark
 * Дополнительно о контроле:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree/ руководство разработчика}
 * * {@link http://axure.tensor.ru/StandardsV8/%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE.html Спецификация Axure}
 * * {@link /materials/Controls-demo/app/Controls-demo%2FList%2FTree%2FSingleExpand демо-пример с множественным выбором элементов и с единичным раскрытием содержимого папок}
 * * {@link /materials/Controls-demo/app/Controls-demo%2FList%2FTree%2FTreeWithPhoto демо-пример с пользовательским шаблоном элемента списка с фото}
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_treeGrid.less переменные тем оформления treeGrid}
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_list.less переменные тем оформления list}
 *
 * @class Controls/_treeGridOld/View
 * @extends Controls/_grid/Grid
 * @mixes Controls/interface:ISource
 * @mixes Controls/list:IClickableView
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedGrid
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/list:IList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/interface:IHierarchy
 * @implements Controls/tree:ITreeControl
 * @mixes Controls/interface/ITreeGridItemTemplate
 * @mixes Controls/interface:IDraggable
 * @mixes Controls/grid:IGridControl
 * @mixes Controls/grid:IPropStorage
 * @mixes Controls/treeGrid:IReloadableTreeGrid
 *
 * @mixes Controls/list:IVirtualScrollConfig
 *
 *
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/treeGrid/Base/TreeGridView/Index
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
 * @class Controls/_treeGridOld/View
 * @extends Controls/_grid/Grid
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedGrid
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/list:IList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/interface:ISorting
 * @mixes Controls/interface:IHierarchy
 * @implements Controls/tree:ITreeControl
 * @mixes Controls/interface/ITreeGridItemTemplate
 * @mixes Controls/interface:IDraggable
 * @mixes Controls/grid:IGridControl
 * @mixes Controls/grid:IPropStorage
 * @mixes Controls/list:IVirtualScrollConfig
 * @mixes Controls/treeGrid:IReloadableTreeGrid
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
      return this._children.listControl.toggleExpanded(id);
   }

   goToPrev(): Model {
      return this._children.listControl.goToPrev();
   }

   goToNext(): Model {
      return this._children.listControl.goToNext();
   }

   /**
    * Возвращает следующую запись в проекции дерева.
    * @function Controls/_treeGridOld/View#getNextItem
    * @param {String|Number} key Ключ записи, относительно которой нужно найти следующую запись.
    * @return {Model} Следующая запись.
    */
   getNextItem(key: CrudEntityKey): Model {
      return this._children.listControl.getNextItem(key);
   }

   /**
    * Возвращает предыдущую запись в проекции дерева.
    * @function Controls/_treeGridOld/View#getPrevItem
    * @param {String|Number} key Ключ записи, относительно которой нужно найти предыдущую запись.
    * @return {Model} Предыдущая запись.
    */
   getPrevItem(key: CrudEntityKey): Model {
      return this._children.listControl.getPrevItem(key);
   }

   static getDefaultOptions(): object {
      return {
         root: null
      };
   }
}
/**
 * @typedef {String} Position
 * @variant default Стандартное расположение иконки узла.
 * @variant right Расположение иконки узла справа.
 * @variant custom Произвольное расположение иконки узла. При данном значении опции, шаблон иконки передается в прикладной шаблон и может быть выведен в любом месте записи.
 */
/**
 * @name Controls/_treeGridOld/View#expanderPosition
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
 * @name Controls/_treeGridOld/View#root
 * @cfg {Number|String} Идентификатор корневого узла.
 */
/**
 * @name Controls/_treeGridOld/View#markerMoveMode
 * @cfg {String} Режим перемещения маркера по кнопкам вверх/вниз.
 * @variant all Маркер движется по всем записям.
 * @variant leaves Маркер движется по листьям. Узлы раскрываются до ближайшего листа.
 */
/**
 * @name Controls/_treeGridOld/View#markedLeafChangeCallback
 * @cfg {Function} Функция обратного вызова, которая будет вызываться при смене выделенного листа, когда опция {@link markerMoveMode} установлена в значение "leaves".
 * @remark
 * Единственный аргумент: положение выделенного листа:
 * 
 * * first - выделенный лист является первым листом в дереве.
 * * last - выделенный лист является последним листом в дереве.
 * * middle - выделенный лист между первым и последним листом в дереве.
 * * single - выделенный лист единственный в дереве.
 */

/**
 * Загружает модель из {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}, объединяет изменения в текущих данных и отображает элемент.
 * @name Controls/_treeGridOld/View#reloadItem
 * @function
 * @param {String} key Идентификатор элемента коллекции, который должен быть перезагружен из источника.
 * @param {Object} readMeta Метаинформация, которая будет передана методу запроса/чтения.
 * @param {String} direction Если аргумент установлен в значение "depth", то перезагрузка происходит с сохранением загруженных записей, т.е. они остаются в списке на клиенте.
 */

Object.defineProperty(Tree, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Tree.getDefaultOptions();
   }
});
