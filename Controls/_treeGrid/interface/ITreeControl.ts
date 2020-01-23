/**
 * Интерфейс для древовидных списков.
 *
 * @interface Controls/_treeGrid/interface/ITreeControl
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for tree-like lists.
 *
 * @interface Controls/_treeGrid/interface/ITreeControl
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
 * @name Controls/_treeGrid/interface/ITreeControl#expandByItemClick
 * @cfg {Boolean} Определят режим разворачивания и сворачивания узлов в {@link Controls/treeGrid:View дереве}.
 * @default false
 * @remark
 * См. <a href="/materials/demo-ws4-tree-grid-base">демо-пример</a>
 * Доступные значения:
 * 
 * * true — осуществляется по клику на него.
 * * false — осуществляется только по клику на экспандер.
 * @see expandedItems
 * @see expanderVisibility
 */

/*
 * @name Controls/_treeGrid/interface/ITreeControl#expandByItemClick
 * @cfg {Boolean} Defines the mode of node expanding.
 * @variant true Toggle node by click on it's whole area.
 * @variant false Toggle node by click on only it's expander.
 * @default false
 * <a href="/materials/demo-ws4-tree-grid-base">Example</a>.
 */

/**
 * @name Controls/_treeGrid/interface/ITreeControl#expandedItems
 * @cfg {Array.<String>|undefined} Устанавливает массив идентификаторов развернутых узлов {@link Controls/treeGrid:View дерева}.
 * @default undefined
 * @remark
 * См. <a href="/materials/demo-ws4-tree-grid-base">демо-пример</a>
 * Чтобы развернуть все элементы списка, параметр expandedItems должен быть задан как массив, содержащий один элемент — "null". В этом случае предполагается, что все данные будут загружены сразу.
 * @see expandByItemClick
 * @see expanderVisibility
 */

/*
 * @name Controls/_treeGrid/interface/ITreeControl#expandedItems
 * @cfg {{Array.<String>}} Array of identifiers of expanded items.
 * <b>Note:</b>
 * To expand all items, this option must be set as array containing one element “null”.
 * In this case, it is assumed that all data will be loaded initially.
 * @notice Without binding this option will be static. Use binding to allow expanding/collapsing nodes.
 * <a href="/materials/demo-ws4-tree-grid-base">Example</a>.
 * @example
 * <pre>
 *      <Controls.treeGrid:View
 *           bind:expandedItems="_expandedItems">
 *      </Controls.treeGrid:View>
 *  </pre>
 *  @see collapsedItems
 */

/**
 * @name Controls/_treeGrid/interface/ITreeControl#collapsedItems
 * @cfg {Boolean} Массив идентификаторов свернутых узлов дерева.
 * Этот параметр используется только при значении {@link Controls/_treeGrid/interface/ITreeControl#expandedItems expandedItems} - [null].
 * <a href="/materials/demo-ws4-tree-grid-base">Example</a>.
 */

/*
 * @name Controls/_treeGrid/interface/ITreeControl#collapsedItems
 * @cfg {Boolean} Array of identifiers of collapsed items.
 * This option is used only when the value of {@link Controls/_treeGrid/interface/ITreeControl#expandedItems expandedItems} is [null].
 * @notice Without binding this option will be static. Use binding to allow expanding/collapsing nodes.
 * <a href="/materials/demo-ws4-tree-grid-base">Example</a>.
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
 * @name Controls/_treeGrid/interface/ITreeControl#nodeFooterTemplate
 * @cfg {Function} Шаблон подвала раскрытого узла дерева.
 * <a href="/materials/demo-ws4-tree-grid-extended">Example</a>.
 */

/*
 * @name Controls/_treeGrid/interface/ITreeControl#nodeFooterTemplate
 * @cfg {Function} Sets footer template that will be shown for every node.
 * <a href="/materials/demo-ws4-tree-grid-extended">Example</a>.
 */

/**
 * @name Controls/_treeGrid/interface/ITreeControl#nodeFooterVisibilityCallback
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
 * @name Controls/_treeGrid/interface/ITreeControl#hasChildrenProperty
 * @cfg {String} Имя свойства, содержащего информацию о наличии дочерних элементов в узле дерева.
 * <a href="/materials/demo-ws4-tree-grid-extended">Example</a>.
 */

/*
 * @name Controls/_treeGrid/interface/ITreeControl#hasChildrenProperty
 * @cfg {String} Name of the field that contains information whether the node has children.
 * <a href="/materials/demo-ws4-tree-grid-extended">Example</a>.
 */

/**
 * @typedef {String} ExpanderVisibility
 * @variant visible Всегда показывать экспандер для узлов и отступ для листьев.
 * @variant hasChildren Показывать экспандер только для узлов с дочерними элементами.
 */



/**
 * @name Controls/_treeGrid/interface/ITreeControl#expanderVisibility
 * @cfg {ExpanderVisibility} Устанавливает режим отображения элемента развертывания узла {@link Controls/treeGrid:View дерева}.
 * @default visible
 * @remark
 * См. <a href="/materials/demo-ws4-tree-grid-extended">демо-пример</a>.
 * @see expandedItems
 * @see expandByItemClick
 */

/*
 * @name Controls/_treeGrid/interface/ITreeControl#expanderVisibility
 * @cfg {String} Mode displaying expander indent.
 * @variant visible Always show expander for nodes and indentation for leaves.
 * @variant hasChildren Show expander only for nodes with children.
 * @default visible
 * <a href="/materials/demo-ws4-tree-grid-extended">Example</a>.
 */

/**
 * @name Controls/_treeGrid/interface/ITreeControl#nodeLoadCallback
 * @cfg {Function} Функция обратного вызова для определения загрузки содержимого узла дерева.
 */

/*
 * @name Controls/_treeGrid/interface/ITreeControl#nodeLoadCallback
 * @cfg {Function} Callback function that will be called when node data loaded by source.
 */

/**
 * @name Controls/_treeGrid/interface/ITreeControl#deepReload
 * @cfg {Boolean} Опередяет, нужно ли выполнять перезагрузку с сохранением раскрытых узлов.
 * @remark
 * Перезагрузка выполняется с сохранением раскрытых узлов, даже при изменении опций filter, source, sorting и тд.
 * В поле фильтра, указанное в parentProperty будет отправлен массив раскрытых узлов.
 * Если в результате запроса для этих узлов будут присланы дочерние элементы, то узлы останутся раскрытыми, иначе они будут свёрнуты.
 * @notice Постраничная навигация в запросе передается для корня и её параметр {@link Controls/_interface/INavigation/PageSourceConfig.typedef pageSize} необходимо применять для всех узлов.
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
 *</pre>
 */

/**
 * @name Controls/_treeGrid/interface/ITreeControl#selectAncestors
 * @cfg {Boolean} Определяет, будут ли отмечаться родительские узлы записи при отметке чекбоксом.
 * @default true
 * @demo Controls-demo/treeGrid/MultiSelect/SelectAncestors/DoNotSelectAncestors/Index
 * @example
 * <Controls.treeGrid.View selectAncestors="{{false}}"/>
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @name Controls/_treeGrid/interface/ITreeControl#selectDescendants
 * @cfg {Boolean} Определяет, будут ли отмечаться дети при отметке узла чекбоксом.
 * @default true
 * @demo Controls-demo/treeGrid/MultiSelect/SelectDescendants/DoNotSelectDescendants/Index
 * @example
 * <Controls.treeGrid.View selectDescendants="{{false}}"/>
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Controls/_treeGrid/interface/ITreeControl#itemExpanded Происходит после развертывания узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Развёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_treeGrid/interface/ITreeControl#afterItemExpand}.
 */

/**
 * @event Controls/_treeGrid/interface/ITreeControl#afterItemExpand Происходит после развертывания узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Развёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Controls/_treeGrid/interface/ITreeControl#beforeItemExpand Происходит перед развертыванием узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Разворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Controls/_treeGrid/interface/ITreeControl#itemExpand Происходит перед развертыванием узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Разворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_treeGrid/interface/ITreeControl#beforeItemExpand}.
 */

/*
 * @event Controls/_treeGrid/interface/ITreeControl#itemExpanded Occurs after node expansion.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {Types/entity:Model} node Expanded node.
 */

/**
 * @event Controls/_treeGrid/interface/ITreeControl#itemCollapsed Происходит после сворачивания узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Свёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_treeGrid/interface/ITreeControl#afterItemCollapse}.
 */

/**
 * @event Controls/_treeGrid/interface/ITreeControl#afterItemCollapse Происходит после сворачивания узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Свёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Controls/_treeGrid/interface/ITreeControl#itemCollapse Происходит перед сворачиванием узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Сворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_treeGrid/interface/ITreeControl#beforeItemCollapse}.
 */

/**
 * @event Controls/_treeGrid/interface/ITreeControl#beforeItemCollapse Происходит перед сворачиванием узла.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Сворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/*
 * @event Controls/_treeGrid/interface/ITreeControl#itemCollapsed Occurs after node collapse.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {Types/entity:Model} node Collapsed node.
 */

/**
 * Перезагружает данные дерева.
 * @function Controls/_treeGrid/interface/ITreeControl#reload
 * @remark
 * Перезагрузка выполняется с сохранением раскрытых узлов.
 * При этом в поле фильтра, указанное в parentProperty будет отправлен массив раскрытых узлов.
 * Если в результате запроса для этих узлов будут присланы дочерние элементы, то узлы останутся раскрытыми, иначе они будут свёрнуты.
 * @notice Постраничная навигация в запросе передается для корня и её параметр {@link Controls/_interface/INavigation/PageSourceConfig.typedef pageSize} необходимо применять для всех узлов.
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
 *</pre>
 */
