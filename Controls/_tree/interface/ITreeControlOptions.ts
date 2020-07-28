import { IControlOptions, TemplateFunction } from 'UI/Base';
import { Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';

/**
 * Интерфейс для древовидных списков.
 *
 * @interface Controls/_tree/interface/ITreeControlOptions
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for tree-like lists.
 *
 * @interface Controls/_tree/interface/ITreeControlOptions
 * @public
 * @author Авраменко А.С.
 */

/**
 * @typedef {String} hierarchyViewModeEnum
 * @variant tree Дерево.
 * @variant breadcrumbs Хлебные крошки.
 */

/*
 * @typedef {String} hierarchyViewModeEnum
 * @variant tree Tree-like view.
 * @variant breadcrumbs Just leaves, folders as paths.
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#expandByItemClick
 * @cfg {Boolean} Определят режим разворачивания и сворачивания узлов в {@link Controls/treeGrid:View дереве}.
 * @default false
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FBasePG">демо-пример</a>
 * Доступные значения:
 *
 * * true — осуществляется по клику на него.
 * * false — осуществляется только по клику на экспандер.
 * @see expandedItems
 * @see expanderVisibility
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#expandByItemClick
 * @cfg {Boolean} Defines the mode of node expanding.
 * @variant true Toggle node by click on it's whole area.
 * @variant false Toggle node by click on only it's expander.
 * @default false
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FBasePG">Example</a>.
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#expandedItems
 * @cfg {Array.<String>|undefined} Идентификаторы развернутых узлов {@link Controls/treeGrid:View дерева}.
 * @default undefined
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FBasePG">демо-пример</a>
 * Чтобы развернуть все элементы списка, параметр expandedItems должен быть задан как массив, содержащий один элемент — "null". В этом случае предполагается, что все данные будут загружены сразу.
 * @see expandByItemClick
 * @see expanderVisibility
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#expandedItems
 * @cfg {{Array.<String>}} Array of identifiers of expanded items.
 * <b>Note:</b>
 * To expand all items, this option must be set as array containing one element “null”.
 * In this case, it is assumed that all data will be loaded initially.
 * @notice Without binding this option will be static. Use binding to allow expanding/collapsing nodes.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FBasePG">Example</a>.
 * @example
 * <pre>
 *      <Controls.treeGrid:View
 *           bind:expandedItems="_expandedItems">
 *      </Controls.treeGrid:View>
 *  </pre>
 *  @see collapsedItems
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#collapsedItems
 * @cfg {Boolean} Массив идентификаторов свернутых узлов дерева.
 * Этот параметр используется только при значении {@link Controls/_treeGrid/interface/ITreeControlOptions#expandedItems expandedItems} - [null].
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FBasePG">Example</a>.
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#collapsedItems
 * @cfg {Boolean} Array of identifiers of collapsed items.
 * This option is used only when the value of {@link Controls/_treeGrid/interface/ITreeControlOptions#expandedItems expandedItems} is [null].
 * @notice Without binding this option will be static. Use binding to allow expanding/collapsing nodes.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FBasePG">Example</a>.
 * @example
 * <pre>
 *      <Controls.treeGrid:View
 *           bind:expandedItems="_expandedItems"
 *           bind:collapsedItems="_collapsedItems">
 *      </Controls.treeGrid:View>
 *  </pre>
 *  @see collapsedItems
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#nodeFooterTemplate
 * @cfg {Function} Шаблон подвала раскрытого узла дерева.
 * @demo Controls-demo/treeGrid/NodeFooter/NodeFooterTemplate/Index
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#nodeFooterTemplate
 * @cfg {Function} Sets footer template that will be shown for every node.
 * @demo Controls-demo/treeGrid/NodeFooter/NodeFooterTemplate/Index
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#nodeFooterVisibilityCallback
 * @cfg {Function} Функция обратного вызова для определения видимости шаблона подвала раскрытого узла дерева.
 * @remark
 * Функция принимает единственный аргумент:
 * <ol>
 *    <li>item — модель (см. {@link Types/entity:Model}), содержащая данные узла, для которого определяется видимость шаблона подвала.</li>
 * </ol>
 * Для видимости шаблона подвала, из функции следует вернуть true.
 * @example
 * Шаблон подвал скрыт для узлов, у которых свойство footerVisible === false.
 * WML:
 * <pre>
 * <Controls.treeGrid:View
 *     attr:class="demo-Tree"
 *     source="{{_source}}"
 *     nodeFooterVisibilityCallback="{{_nodeFooterVisibilityCallback}}"
 *     ...
 * </Controls.list:View>
 * </pre>
 * TS:
 * <pre>
 *  ...
 *  private _nodeFooterVisibilityCallback(item: Model): boolean {
 *   return item.get('footerVisible') !== false;
 *  }
 *  ...
 * </pre>
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#hasChildrenProperty
 * @cfg {String} Имя свойства, содержащего информацию о наличии дочерних элементов в узле дерева.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FExtendedPG">Example</a>.
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#hasChildrenProperty
 * @cfg {String} Name of the field that contains information whether the node has children.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FExtendedPG">Example</a>.
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#searchBreadCrumbsItemTemplate
 * @cfg {TemplateFunction} Шаблон элемента с хлебными крошками в {@link Controls/treeGrid:View дереве} при режиме поиска.
 * @remark
 * По умолчанию используется шаблон "Controls/treeGrid:SearchBreadCrumbsItemTemplate".
 *
 * Базовый шаблон searchBreadCrumbsItemTemplate поддерживает следующие параметры:
 * - checkboxReadOnly {Boolean} — Флаг, позволяющий установить у checkbox в multiSelect режим "только для чтения".
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#searchBreadCrumbsItemTemplate
 * @cfg {TemplateFunction} Element template with breadcrumbs in a {@link Controls/treeGrid:View tree} in search mode.
 * @remark
 * The default template is "Controls/treeGrid:SearchBreadCrumbsItemTemplate".
 *
 * Template supports the following parameters:
 * - checkboxReadOnly {Boolean} — A flag that allows the checkbox to be set to read-only mode.
 */

/**
 * @typedef {String} ExpanderVisibility
 * @variant visible Всегда показывать экспандер для узлов и отступ для листьев.
 * @variant hasChildren Показывать экспандер только для узлов с дочерними элементами.
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#expanderVisibility
 * @cfg {ExpanderVisibility} Режим отображения элемента развертывания узла {@link Controls/treeGrid:View дерева}.
 * @default visible
 * @remark
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FExtendedPG">демо-пример</a>.
 * @see expandedItems
 * @see expandByItemClick
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#expanderVisibility
 * @cfg {String} Mode displaying expander indent.
 * @variant visible Always show expander for nodes and indentation for leaves.
 * @variant hasChildren Show expander only for nodes with children.
 * @default visible
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FExtendedPG">Example</a>.
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#nodeLoadCallback
 * @cfg {Function} Функция обратного вызова для определения загрузки содержимого узла дерева.
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#nodeLoadCallback
 * @cfg {Function} Callback function that will be called when node data loaded by source.
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#deepReload
 * @cfg {Boolean} Опередяет, нужно ли выполнять перезагрузку с сохранением раскрытых узлов.
 * @remark
 * Перезагрузка выполняется с сохранением раскрытых узлов, даже при изменении опций filter, source, sorting и тд.
 * В поле фильтра, указанное в parentProperty будет отправлен массив раскрытых узлов.
 * Если в результате запроса для этих узлов будут присланы дочерние элементы, то узлы останутся раскрытыми, иначе они будут свёрнуты.
 * @notice Постраничная навигация в запросе передается для корня и её параметр {@link Controls/_interface/INavigation/INavigationPageSourceConfig.typedef pageSize} необходимо применять для всех узлов.
 * @notice Обратите внимание! При смене фильтра/навигации/source список раскрытых узлов сбрасывается.
 * @example
 * Пример списочного метода БЛ
 * <pre>
 * def Test.MultiRoot(ДопПоля, Фильтр, Сортировка, Навигация):
 *      rs = RecordSet(CurrentMethodResultFormat())
 *      if Навигация.Type() == NavigationType.ntMULTI_ROOT:
 *          nav_result = {}
 *          for id, nav in Навигация.Roots().items():
 *              # Запрашиваем данные по одному разделу.
 *              Фильтр.Раздел = id
 *              tmp_rs = Test.MultiRoot(ДопПоля, Фильтр, Сортировка, nav)
 *              # Склеиваем результаты.
 *              for rec in tmp_rs:
 *                  rs.AddRow(rec)
 *              # Формируем общий результа навигации по всем разделам.
 *              nav_result[ id ] = tmp_rs.nav_result
 *          rs.nav_result = NavigationResult(nav_result)
 *      else:
 *          # Тут обработка обычной навигации, например, вызов декларативного списка.
 *          rs = Test.DeclList(ДопПоля, Фильтр, Сортировка, Навигация)
 *      return rs
 * </pre>
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#selectAncestors
 * @cfg {Boolean} Определяет, будут ли отмечаться родительские узлы записи при отметке чекбоксом.
 * @default true
 * @demo Controls-demo/treeGrid/MultiSelect/SelectAncestors/DoNotSelectAncestors/Index
 * @example
 * <Controls.treeGrid.View selectAncestors="{{false}}"/>
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#selectDescendants
 * @cfg {Boolean} Определяет, будут ли отмечаться дети при отметке узла чекбоксом.
 * @default true
 * @demo Controls-demo/treeGrid/MultiSelect/SelectDescendants/DoNotSelectDescendants/Index
 * @example
 * <Controls.treeGrid.View selectDescendants="{{false}}"/>
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#markItemByExpanderClick
 * @cfg {Boolean} Определяет, нужно ли выделять узел маркером.
 * @remark Узел отмечается маркером при клике на иконку разворота узла, если значение true.
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTreeGrid%2FItemTemplatePG">демо-пример</a>
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#expanderSize
 * @cfg {String} Размер области, который отведён под иконку узла или скрытого узла.
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @default s
 * @remark
 * Если установлена опция на Controls.treeGrid:View, не требуется устанавливать ее на Controls.treeGrid:ItemTemplate.
 * Каждому значению опции соответствует размер в px. Он зависит от {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
 */

/**
 * @event Controls/_tree/interface/ITreeControlOptions#itemExpanded Происходит после развертывания узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Развёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControlOptions#afterItemExpand}.
 */

/**
 * @event Controls/_tree/interface/ITreeControlOptions#afterItemExpand Происходит после развертывания узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Развёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Controls/_tree/interface/ITreeControlOptions#beforeItemExpand Происходит перед развертыванием узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Разворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Controls/_tree/interface/ITreeControlOptions#itemExpand Происходит перед развертыванием узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Разворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControlOptions#beforeItemExpand}.
 */

/*
 * @event Controls/_tree/interface/ITreeControlOptions#itemExpanded Occurs after node expansion.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {Types/entity:Model} node Expanded node.
 */

/**
 * @event Controls/_tree/interface/ITreeControlOptions#itemCollapsed Происходит после сворачивания узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Свёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControlOptions#afterItemCollapse}.
 */

/**
 * @event Controls/_tree/interface/ITreeControlOptions#afterItemCollapse Происходит после сворачивания узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Свёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Controls/_tree/interface/ITreeControlOptions#itemCollapse Происходит перед сворачиванием узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Сворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControlOptions#beforeItemCollapse}.
 */

/**
 * @event Controls/_tree/interface/ITreeControlOptions#beforeItemCollapse Происходит перед сворачиванием узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Сворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/*
 * @event Controls/_tree/interface/ITreeControlOptions#itemCollapsed Occurs after node collapse.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {Types/entity:Model} node Collapsed node.
 */

type TNodeFooterVisibilityCallback = (item: Model) => boolean;

type TNodeLoadCallback = (list: RecordSet, nodeKey: number | string) => void;

export interface ITreeControlOptions extends IControlOptions {
    expandByItemClick?: boolean;
    expandedItems?: Array<number | string>;
    collapsedItems?: Array<number | string>;
    nodeFooterTemplate?: TemplateFunction;
    nodeFooterVisibilityCallback?: TNodeFooterVisibilityCallback;
    hasChildrenProperty?: string;
    searchBreadCrumbsItemTemplate?: TemplateFunction;
    expanderVisibility?: 'visible'|'hasChildren';
    nodeLoadCallback?: TNodeLoadCallback;
    deepReload?: boolean;
    selectAncestors?: boolean;
    selectDescendants?: boolean;
    markItemByExpanderClick?: boolean;
    expanderSize?: 's'|'m'|'l'|'xl';
}
