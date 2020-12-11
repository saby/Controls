import { IControlOptions, TemplateFunction } from 'UI/Base';
import { Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';


type TNodeFooterVisibilityCallback = (item: Model) => boolean;

type TNodeLoadCallback = (list: RecordSet, nodeKey: number | string) => void;

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
export interface ITreeControlOptions extends IControlOptions {
    expandByItemClick?: boolean;
    expandedItems?: Array<number | string>;
    collapsedItems?: Array<number | string>;
    nodeFooterTemplate?: TemplateFunction;
    nodeFooterVisibilityCallback?: TNodeFooterVisibilityCallback;
    hasChildrenProperty?: string;
    searchBreadCrumbsItemTemplate?: TemplateFunction;
    expanderVisibility?: 'visible'|'hasChildren'|'hasChildrenOrHover';
    nodeLoadCallback?: TNodeLoadCallback;
    deepReload?: boolean;
    selectAncestors?: boolean;
    selectDescendants?: boolean;
    markItemByExpanderClick?: boolean;
    expanderSize?: 's'|'m'|'l'|'xl';
}
/**
 * @typedef {String} HierarchyViewModeEnum
 * @variant tree Дерево.
 * @variant breadcrumbs Хлебные крошки.
 */

/*
 * @typedef {String} HierarchyViewModeEnum
 * @variant tree Tree-like view.
 * @variant breadcrumbs Just leaves, folders as paths.
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#expandByItemClick
 * @cfg {Boolean} Режим разворачивания и сворачивания узлов в {@link Controls/treeGrid:View дереве}.
 * @default false
 * @remark
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
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#expandedItems
 * @cfg {Array.<String>|undefined} Идентификаторы развернутых узлов в {@link Controls/treeGrid:View дереве}.
 * @default undefined
 * @remark
 * Чтобы развернуть все элементы списка, параметр expandedItems должен быть задан как массив, содержащий один элемент — "null". В этом случае предполагается, что все данные будут загружены сразу.
 * Настройка не работает, если источник данных задан через {@link Types/source:Memory}.
 * @see expandByItemClick
 * @see expanderVisibility
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#expandedItems
 * @cfg {{Array.<String>}|undefined} Array of identifiers of expanded items.
 * <b>Note:</b>
 * To expand all items, this option must be set as array containing one element “null”.
 * In this case, it is assumed that all data will be loaded initially.
 * @notice Without binding this option will be static. Use binding to allow expanding/collapsing nodes.
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
 * @cfg {Array.<String>|undefined} Идентификаторы свернутых узлов в {@link Controls/treeGrid:View дереве}.
 * @remark
 * Этот параметр используется, когда {@link expandedItems} установлена в значение [null].
 * @see expandedItems
 *
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#collapsedItems
 * @cfg {Array.<String>|Array.<Number>} Array of identifiers of collapsed items.
 * This option is used only when the value of {@link Controls/_tree/interface/ITreeControlOptions#expandedItems expandedItems} is [null].
 * @notice Without binding this option will be static. Use binding to allow expanding/collapsing nodes.
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
 * @cfg {Function} Шаблон подвала раскрытого узла в {@link Controls/treeGrid:View дереве}.
 * @remark
 * В области видимости шаблона доступен объект itemData, внутри доступно свойство item - запись, под которой отрисовывается шаблон.
 * @demo Controls-demo/treeGrid/NodeFooter/NodeFooterTemplate/Index
 * @see nodeFooterVisibilityCallback
 * @see nodeLoadCallback
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#nodeFooterTemplate
 * @cfg {Function} Sets footer template that will be shown for every node.
 * @demo Controls-demo/treeGrid/NodeFooter/NodeFooterTemplate/Index
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#nodeFooterVisibilityCallback
 * @cfg {Function} Функция обратного вызова для определения видимости шаблона подвала раскрытого узла в {@link Controls/treeGrid:View дереве}.
 * @remark
 * Функция принимает единственный аргумент:
 *
 * * item — модель (см. {@link Types/entity:Model}), содержащая данные узла, для которого определяется видимость шаблона подвала.
 *
 * Для видимости шаблона подвала, из функции следует вернуть true.
 * @example
 * Шаблон подвал скрыт для узлов, у которых свойство footerVisible === false.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.treeGrid:View
 *     attr:class="demo-Tree"
 *     source="{{_source}}"
 *     nodeFooterVisibilityCallback="{{_nodeFooterVisibilityCallback}}"
 *     ...
 * </Controls.list:View>
 * </pre>
 * <pre class="brush: js">
 * // TypeScript
 * ...
 * private _nodeFooterVisibilityCallback(item: Model): boolean {
 *   return item.get('footerVisible') !== false;
 * }
 * ...
 * </pre>
 * @see nodeFooterTemplate
 * @see nodeLoadCallback
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#hasChildrenProperty
 * @cfg {String} Имя свойства, содержащего информацию о наличии дочерних элементов в узле {@link Controls/treeGrid:View дерева}.
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#hasChildrenProperty
 * @cfg {String} Name of the field that contains information whether the node has children.
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#searchBreadCrumbsItemTemplate
 * @cfg {TemplateFunction} Шаблон отображения элемента с хлебными крошками в {@link Controls/treeGrid:View дереве} при {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/mode/ режиме поиска}.
 * @remark
 * По умолчанию используется базовый шаблон "Controls/treeGrid:SearchBreadCrumbsItemTemplate", который поддерживает следующий параметр:
 *
 * * checkboxReadOnly {Boolean} — флаг, позволяющий установить у checkbox в multiSelect режим "только для чтения".
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
 * @variant hasChildren Показывать экспандер только для узлов с дочерними элементами. В этом значении опция, также, отключает отступ для листьев, если в текущей папке нет записей с дочерними элементами.
 * @variant hasChildrenOrHover Работает аналогично hasChildren, но в дополнение для узлов без дочерних элементов:
 * <ul>
 *     <li>показывает контурный экспандер если такой узел является развернутым</li>
 *     <li>показывает контурный экспандер при наведении на свернутый узел</li>
 * </ul>
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#expanderVisibility
 * @cfg {ExpanderVisibility} Режим отображения экспандера в {@link Controls/treeGrid:View дереве}.
 * @default visible
 * @demo Controls-demo/treeGrid/Expander/ExpanderIcon/Node/Index В следующем примере для контрола опция expanderVisibility установлена в значение visible.
 * @demo Controls-demo/treeGrid/Expander/ExpanderVisibility/HasChildren/Index В следующем примере для контрола опция expanderVisibility установлена в значение hasChildren.
 * @demo Controls-demo/treeGrid/Expander/ExpanderVisibility/HasChildrenOrHover/Index В следующем примере для контрола опция expanderVisibility установлена в значение hasChildrenOrHover.
 * @see expanderIcon
 * @see expanderSize
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#expanderVisibility
 * @cfg {String} Mode displaying expander indent.
 * @variant visible Always show expander for nodes and indentation for leaves.
 * @variant hasChildren Show expander only for nodes with children.
 * @variant hasChildrenOrHover Works similar to hasChildren. But in addition for nodes with no children:
 * <ul>
 *     <li>shows an outline expander if such a node is expanded</li>
 *     <li>shows an outline expander when hovering over a collapsed node</li>
 * </ul>
 * @default visible
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#nodeLoadCallback
 * @cfg {Function} Функция обратного вызова для определения загрузки содержимого узла в {@link Controls/treeGrid:View дереве}.
 * @see nodeFooterTemplate
 * @see nodeFooterVisibilityCallback
 */

/*
 * @name Controls/_tree/interface/ITreeControlOptions#nodeLoadCallback
 * @cfg {Function} Callback function that will be called when node data loaded by source.
 * @see nodeFooterTemplate
 * @see nodeFooterVisibilityCallback
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#deepReload
 * @cfg {Boolean} Опередяет, нужно ли выполнять перезагрузку с сохранением раскрытых узлов.
 * @remark
 * Перезагрузка выполняется с сохранением раскрытых узлов, даже при изменении опций filter, source, sorting и тд.
 * В поле фильтра, указанное в parentProperty будет отправлен массив раскрытых узлов.
 * Если в результате запроса для этих узлов будут присланы дочерние элементы, то узлы останутся раскрытыми, иначе они будут свёрнуты.
 * **Примечание.** Постраничная навигация в запросе передается для корня и её параметр {@link Controls/_interface/INavigation/INavigationPageSourceConfig.typedef pageSize} необходимо применять для всех узлов.
 * **Обратите внимание!** При смене фильтра/навигации/source список раскрытых узлов сбрасывается.
 * @example
 * Пример списочного метода БЛ
 * <pre class="brush: python">
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
 * <pre class="brush: html">
 * <Controls.treeGrid.View selectAncestors="{{false}}"/>
 * </pre>
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @see selectDescendants
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#selectDescendants
 * @cfg {Boolean} Определяет, будут ли отмечаться дети при отметке узла чекбоксом.
 * @default true
 * @demo Controls-demo/treeGrid/MultiSelect/SelectDescendants/DoNotSelectDescendants/Index
 * @example
 * <pre class="brush: html">
 * <Controls.treeGrid.View selectDescendants="{{false}}"/>
 * </pre>
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @see selectAncestors
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#markItemByExpanderClick
 * @cfg {Boolean} Определяет, нужно ли выделять узел маркером.
 * @remark Узел отмечается маркером при клике на иконку разворота узла, если значение true.
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @typedef {String} ExpanderSize
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 */

/**
 * @name Controls/_tree/interface/ITreeControlOptions#expanderSize
 * @cfg {ExpanderSize} Размер области, который отведён под иконку узла или скрытого узла.
 * @default s
 * @remark
 * Опции {@link Controls/_tree/interface/ITreeControlOptions#expanderSize expanderSize на контроле} и {@link Controls/treeGrid:ItemTemplate#expanderSize expanderSize на шаблоне элемента} не являются взаимоисключающими.
 * {@link Controls/_tree/interface/ITreeControlOptions#expanderSize expanderSize на контроле} определяет размер области отведённой под иконку узла или скрытого узла для всего списка,
 * включая автоматическую конфигурацию {@link Controls/_tree/interface/ITreeControlOptions#nodeFooterTemplate шаблона подвалов узлов}.
 * Опция {@link Controls/treeGrid:ItemTemplate#expanderSize expanderSize на шаблоне элемента} приоритетнее, чем {@link Controls/_tree/interface/ITreeControlOptions#expanderSize expanderSize на контроле}.
 * В случае, если для разных элементов дерева заданы разные значения опции, то для корректного выравнивания подвалов узлов необходимо продублировать опцию на
 * {@link Controls/_tree/interface/ITreeControlOptions#nodeFooterTemplate шаблоне подвалов узлов}.
 * @see expanderIcon
 * @see expanderVisibility
 */

/**
 * @typedef {String} ExpanderIcon
 * @variant none Иконки всех узлов не отображаются.
 * @variant node Иконки всех узлов отображаются как иконки узлов.
 * @variant hiddenNode Иконки всех узлов отображаются как иконки скрытых узлов."
 */
/**
 * @name Controls/_tree/interface/ITreeControlOptions#expanderIcon
 * @cfg {ExpanderIcon|undefined} Стиль отображения иконки для узла и скрытого узла.
 * @default undefined
 * @remark
 * Когда в опции задано undefined, используются иконки узлов и скрытых узлов.
 * Опции {@link Controls/_tree/interface/ITreeControlOptions#expanderIcon expanderIcon на контроле} и {@link Controls/treeGrid:ItemTemplate#expanderIcon expanderIcon на шаблоне элемента} не являются взаимоисключающими.
 * {@link Controls/_tree/interface/ITreeControlOptions#expanderIcon expanderIcon на контроле} определяет стиль отображения иконки для узла и скрытого узла для всего списка,
 * включая автоматическую конфигурацию {@link Controls/_tree/interface/ITreeControlOptions#nodeFooterTemplate шаблона подвалов узлов}.
 * Опция {@link Controls/treeGrid:ItemTemplate#expanderIcon expanderIcon на шаблоне элемента} приоритетнее, чем {@link Controls/_tree/interface/ITreeControlOptions#expanderIcon expanderIcon на контроле}.
 * В случае, если для разных элементов дерева заданы разные значения опции, то для корректного выравнивания подвалов узлов необходимо продублировать опцию на
 * {@link Controls/_tree/interface/ITreeControlOptions#nodeFooterTemplate шаблоне подвалов узлов}.
 * @see expanderSize
 * @see expanderVisibility
 */

/**
 * @event Происходит после развертывания узла.
 * @name Controls/_tree/interface/ITreeControlOptions#afterItemExpand
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Развёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Происходит перед развертыванием узла.
 * @name Controls/_tree/interface/ITreeControlOptions#beforeItemExpand
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Разворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Происходит перед развертыванием узла.
 * @name Controls/_tree/interface/ITreeControlOptions#itemExpand
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Разворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControlOptions#beforeItemExpand beforeItemExpand}.
 */

/**
 * @event Происходит после развертывания узла.
 * @name Controls/_tree/interface/ITreeControlOptions#itemExpanded
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Развёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControlOptions#afterItemExpand afterItemExpand}.
 */

/*
 * @event Occurs after node expansion.
 * @name Controls/_tree/interface/ITreeControlOptions#itemExpanded
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {Types/entity:Model} node Expanded node.
 */

/**
 * @event Происходит после сворачивания узла.
 * @name Controls/_tree/interface/ITreeControlOptions#afterItemCollapse
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Свёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Происходит перед сворачиванием узла.
 * @name Controls/_tree/interface/ITreeControlOptions#itemCollapse
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Сворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControlOptions#beforeItemCollapse beforeItemCollapse}.
 */

/**
 * @event Происходит перед сворачиванием узла.
 * @name Controls/_tree/interface/ITreeControlOptions#beforeItemCollapse
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Сворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Происходит после сворачивания узла.
 * @name Controls/_tree/interface/ITreeControlOptions#itemCollapsed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Свёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControlOptions#afterItemCollapse afterItemCollapse}.
 */

/*
 * @event Occurs after node collapse.
 * @name Controls/_tree/interface/ITreeControlOptions#itemCollapsed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {Types/entity:Model} node Collapsed node.
 */

/**
 * @event Происходит при изменении набора развернутых узлов.
 * @name Controls/_tree/interface/ITreeControlOptions#expandedItemsChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array.<Number|String>} expandedItems Идентификаторы развернутых узлов.
 */

/**
 * @event Происходит при изменении набора свернутых узлов.
 * @name Controls/_tree/interface/ITreeControlOptions#collapsedItemsChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array.<Number|String>} expandedItems Идентификаторы свернутых узлов.
 */
