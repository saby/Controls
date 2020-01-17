/**
 * Интерфейс для контрола {@link Controls/grid:View Таблица}.
 *
 * @interface Controls/_grid/interface/IGridControl
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for Grid (table view).
 *
 * @interface Controls/_grid/interface/IGridControl
 * @public
 * @author Авраменко А.С.
 */

/**
 * @name Controls/_grid/interface/IGridControl#ladderProperties
 * @cfg {Array.<String>} Массив свойств, по которым происходит прилипание.
 * Работу лесенки можно проверить на <a href="/materials/demo-ws4-grid-sticky">демо-примере</a>.
 * @example
 * Пример 1. Шаблон лесенки задан в рамках шаблона родительского контрола.
 * <pre class="brush: html">
 *    <!-- MyControl.wml -->
 *    <div class="demoGrid">
 *       <Controls.grid:View ladderProperties="{{ ['date'] }}">
 *          <ws:columns>
 *             <ws:Array>
 *                <ws:Object width="1fr">
 *                   <ws:template>
 *                      <ws:partial template="Controls/grid:ColumnTemplate">
 *                         <ws:contentTemplate>
 *                            <ws:partial template="{{template.ladderWrapper}}" ladderProperty="date">
 *                               <div class="demoGrid__date">
 *                                  {{template.itemData.item['date']}}
 *                               </div>
 *                            </ws:partial>
 *                         </ws:contentTemplate>
 *                      </ws:partial>
 *                   </ws:template>
 *                </ws:Object>
 *             </ws:Array>
 *          </ws:columns>
 *       </Controls.grid:View>
 *    </div>
 * </pre>
 *
 * Пример 2. Шаблон лесенки вынесен в отдельный шаблон.
 * <pre class="brush: html">
 *    <!-- MyControl.wml -->
 *    <div class="demoGrid">
 *       <Controls.grid:View
 *          ...
 *          ladderProperties="{{ ['date'] }}">
 *          <ws:columns>
 *             <ws:Array>
 *                <ws:Object width="1fr" template="wml!MyModule/MyTemplate" />
 *             </ws:Array>
 *          </ws:columns>
 *       </Controls.grid:View>
 *    </div>
 * </pre>
 * <pre class="brush: html">
 *    <!-- MyTemplate.wml -->
 *    <ws:partial template="{{ladderWrapper}}" ladderProperty="date">
 *       <div class="demoGrid__date">
 *          {{itemData.item['date']}}
 *       </div>
 *    </ws:partial>
 * </pre>
 */

/*
 * @name Controls/_grid/interface/IGridControl#ladderProperties
 * @cfg {Array.<String>} Array of fields that should be sticky.
 * <a href="/materials/demo-ws4-grid-sticky">Example</a>
 * @example
 * Set ladderProperties and render item template through the ladderWrapper:
 * <pre>
 *    <div class="demoGrid">
 *       <Controls.grid:View
 *          ...
 *          ladderProperties="{{ ['date'] }}">
 *          <ws:columns>
 *             <ws:Array>
 *                <ws:Object width="1fr">
 *                   <ws:template>
 *                      <ws:partial template="Controls/grid:ColumnTemplate">
 *                         <ws:contentTemplate>
 *                            <ws:partial template="{{template.ladderWrapper}}" ladderProperty="date">
 *                               <div class="demoGrid__date">
 *                                  {{template.itemData.item['date']}}
 *                               </div>
 *                            </ws:partial>
 *                         </ws:contentTemplate>
 *                      </ws:partial>
 *                   </ws:template>
 *                </ws:Object>
 *             </ws:Array>
 *          </ws:columns>
 *       </Controls.grid:View>
 *    </div>
 * </pre>
 */

/*
 * @typedef {String} GridCellAlign
 * @variant left Align content to left side.
 * @variant center Align content to center.
 * @variant right Align content to right side.
 */

/*
 * @typedef {String} GridCellVAlign
 * @variant top Align content to top side.
 * @variant center Align content to center.
 * @variant bottom Align content to bottom side.
 */

/*
 * @typedef {Object} cellPadding
 * @property {enum('s'|'null')} left левый отступ ячейки.
 * @property {enum('s'|'null')} right правый отступ ячейки.
 */

/**
 * @name Controls/_grid/interface/IGridControl#header
 * @cfg {Controls/grid:IHeaderCell} Описывает шапку таблицы. В качестве значения опция принимает массив объектов, в которых задают конфигурацию для ячеек шапки. Для одноуровневых шапок первый объект массива задаёт конфигурацию для первой ячейки. Условно ячейки шапки нумеруются слева направо. Для многоуровневой шапки порядок объектов массива не соответствует конфигуруемой ячейке.
 * <a href="/doc/platform/developmentapl/interface-development/controls/list/grid/templates/header/">См. руководство разработчика</a>
 * <a href="/materials/demo-ws4-grid-base">См. демо-пример</a>
 * @example
 * Пример 1. Для первой ячейки задаём пользовательский шаблон.
 * <pre>
 *    <Controls.grid:View>
 *       <ws:header>
 *          <ws:Array>
 *              <ws:template>
 *                  <ws:partial template="Controls/grid:HeaderContent" attr:class="controls-Grid__header-cell_spacing_money" colData="{{colData}}" />
 *              </ws:template>
 *          </ws: Array>
 *       </ws:header>
 *    </Controls.grid:View>
 * </pre>
 * @example
 * Пример 2. Настройка опции задаётся в хуке и передаётся в шаблон.
 * <pre>
 * _header: null,
 * _beforeMount: function(options) {
 *      this._header = [
 *      {
 *          caption: 'Name',
 *          startRow: 1,
 *          endRow: 3,
 *          startColumn: 1,
 *          endColumn: 2
 *      },
 *      {
 *          caption: 'Price',
 *          startRow: 1,
 *          endRow: 2,
 *          startColumn: 2,
 *          endColumn: 4
 *      },
 *      {
 *          caption: 'Cell',
 *          startRow: 2,
 *          endRow: 3,
 *          startColumn: 2,
 *          endColumn: 3
 *      },
 *      {
 *          caption: 'Residue',
 *          startRow: 2,
 *          endRow: 3,
 *          startColumn: 3,
 *          endColumn: 4
 *      }
 *      ]
 * }
 * </pre>
 */

/*
 * @name Controls/_grid/interface/IGridControl#header
 * @cfg {Array.<HeaderCell>} Describes grid's header.
 * <a href="/materials/demo-ws4-grid-base">Example</a>
 * @remark
 * Base header content template for Controls/grid:View: "Controls/grid:HeaderContent".
 * @example
 * Add header text spacing for columns with money fields:
 * <pre>
 *    <ws:partial template="Controls/grid:HeaderContent" attr:class="controls-Grid__header-cell_spacing_money" colData="{{colData}}" />
 * </pre>
 */

/**
 * @name Controls/_grid/interface/IGridControl#columns
 * @cfg {Array.<Controls/grid:IColumn>} Описывает колонки таблицы. Колонки объекты реализующие интерфейс {@link Controls/grid:IColumn IColumn}
 * <a href="/materials/demo-ws4-grid-base">Example</a>
 * @remark Перед отрисовкой убедитесь, что {@link Types/display:Collection Collection} содержит необходимые данные при изменении параметра {@link Controls/_grid/interface/IGridControl#columns columns}. При необходимости вызовите асинхронный метод "reload" перед изменением параметра {@link Controls/_grid/interface/IGridControl#columns columns}.
 * @example
 * <pre>
 * _columns = [
 * {
 *     displayProperty: 'name',
 *     width: '1fr',
 *     align: 'left',
 *     template: _customNameTemplate
 * },
 * {
 *     displayProperty: 'balance',
 *     align: 'right',
 *     width: 'auto',
 *     resutTemplate: '_customResultTemplate',
 *     result: 12340
 * }
 * ];
 * </pre>
 * <pre>
 *  <Controls.grid:View
 *      ...
 *      columns="{{_columns}}">
 *  </Controls.grid:View>
 * </pre>
 */

/*
 * @name Controls/_grid/interface/IGridControl#columns
 * @cfg {TColumns} Describes grid's columns.
 * <a href="/materials/demo-ws4-grid-base">Example</a>
 * @remark Before rendering, make sure that {@link Types/display:Collection Collection} contains required data, when the {@link Controls/_grid/interface/IGridControl#columns columns} option changes. Call asynchronous 'reload' method before changing {@link Controls/_grid/interface/IGridControl#columns columns} option, if necessary.
 * @example
 * <pre>
 * _columns = [
 * {
 *     displayProperty: 'name',
 *     width: '1fr',
 *     align: 'left',
 *     template: _customNameTemplate
 * },
 * {
 *     displayProperty: 'balance',
 *     align: 'right',
 *     width: 'auto',
 *     resutTemplate: '_customResultTemplate',
 *     result: 12340
 * }
 * ];
 * </pre>
 * <pre>
 *  <Controls.grid:View
 *      ...
 *      columns="{{_columns}}">
 *  </Controls.grid:View>
 * </pre>
 */

/**
 * @name Controls/_grid/interface/IGridControl#stickyHeader
 * @cfg {Boolean} Закрепляет заголовок таблицы.
 * <a href="/materials/demo-ws4-grid-sticky">Example</a>
 * @default true
 */

/*
 * @name Controls/_grid/interface/IGridControl#stickyHeader
 * @cfg {Boolean} Fix the table header.
 * <a href="/materials/demo-ws4-grid-sticky">Example</a>
 * @default true
 */

/**
 * @name Controls/_grid/interface/IGridControl#columnScroll
 * @cfg {Boolean} Включает скроллирование колонок.
 * @default false
 * @see Controls/_grid/interface/IGridControl#columnScrollStartPosition
 * @see Controls/_grid/interface/IGridControl#stickyColumnsCount
 */

/*
 * @name Controls/_grid/interface/IGridControl#columnScroll
 * @cfg {Boolean} Enable column scroll.
 * @default false
 * @see Controls/_grid/interface/IGridControl#columnScrollStartPosition
 * @see Controls/_grid/interface/IGridControl#stickyColumnsCount
 */

/**
 * @name Controls/_grid/interface/IGridControl#columnScrollStartPosition
 * @cfg {String} Определяет начальное положение горизонтальной прокрутки колонок, если она включена.
 * @variant start Устанавливает горизонтальную прокрутку в начальное (крайнее левое) положение.
 * @variant end Устанавливает горизонтальную прокрутку в конечное (крайнее правое) положение.
 * @default start
 * @see Controls/_grid/interface/IGridControl#columnScroll
 */

/*
 * @name Controls/_grid/interface/IGridControl#columnScrollStartPosition
 * @cfg {String} Determines the starting columns scroll position if it is enabled.
 * @variant start Puts horizontal scroll into the leftmost position.
 * @variant end Puts horizontal scroll into the rightmost position.
 * @default start
 * @see Controls/_grid/interface/IGridControl#columnScroll
 */

/**
 * @name Controls/_grid/interface/IGridControl#stickyColumnsCount
 * @cfg {Number} Определяет число зафиксированных колонок, которые не двигаются при горизонтальном скролле.
 * @default 1
 * @see Controls/_grid/interface/IGridControl#columnScroll
 * @remark
 * Столбец флагов множественного выбора всегда зафиксирован, и не входит в число stickyColumnsCount.
 */

/*
 * @name Controls/_grid/interface/IGridControl#stickyColumnsCount
 * @cfg {Number} Determines the number of fixed columns that do not move during horizontal scroll.
 * @default 1
 * @see Controls/_grid/interface/IGridControl#columnScroll
 * @remark
 * Multiple selection column is always fixed and does not count towards this number.
 */

/**
 * @name Controls/_grid/interface/IGridControl#rowSeparatorVisibility
 * @cfg {Boolean} Позволяет отображать/скрывать разделитель строк.
 * <a href="/materials/demo-ws4-grid-base">Example</a>
 * @default false
 */

/*
 * @name Controls/_grid/interface/IGridControl#rowSeparatorVisibility
 * @cfg {Boolean} Allows to visible or hide row separator.
 * <a href="/materials/demo-ws4-grid-base">Example</a>
 * @default false
 */

 /**
 * @name Controls/_grid/interface/IGridControl#resultsTemplate
 * @cfg {Function} Устанавливает шаблон отображения строки итогов.
 * @default Controls/grid:ResultsTemplate
 * @remark
 * Подробнее о параметрах шаблона Controls/grid:ResultsTemplate читайте {@link Controls/grid:ResultsTemplate здесь}.
 * Подробнее о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/templates/result/ здесь}.
 * @see resultsPosition
 * @see resultsVisibility
 */

/*
 * @name Controls/_grid/interface/IGridControl#resultsTemplate
 * @cfg {Function} Results row template.
 * @default Controls/grid:ResultsTemplate
 * @see resultsPosition
 * @see resultsVisibility
 */

/**
 * @typedef {String} ResultsPosition
 * @variant top Строка располагается над списком.
 * @variant bottom Строка располагается под списком.
 */

/**
 * @name Controls/_grid/interface/IGridControl#resultsPosition
 * @cfg {ResultsPosition|undefined} Устанавливает положение строки итогов.
 * @default undefined
 * @remark
 * При значении опции **undefined** строка итогов скрыта.
 * @result
 * @see resultsTemplate
 * @see resultsVisibility
 */

/*
 * @name Controls/_grid/interface/IGridControl#resultsPosition
 * @cfg {String} Results row position.
 * @variant top Show results above the list.
 * @variant bottom Show results below the list.
 */

/**
 * @name Controls/_grid/interface/IGridControl#resultsVisibility
 * @cfg {String} Устанавливает режим отображения строки итогов.
 * @remark
 * Доступные значения:
 *
 * * **hasdata** — отображается при наличии более 1 записи в списке.
 * * **visible** — отображается всегда, вне зависимости от количества записей в списке.
 * @default hasData
 * @see resultsTemplate
 * @see resultsPosition
 */

/**
 * @name Controls/_grid/interface/IGridControl#editArrowVisibilityCallback
 * @cfg {Function} Функция обратного вызова для определения видимости кнопки открытия карточки в панели действий по свайпу для конкретной записи.
 * @remark Первый и единственный аргумент - текущая запись, на которой открывается свайп.
 */

/**
 * @name Controls/_grid/interface/IGridControl#showEditArrow
 * @cfg {Boolean} Позволяет отображать по ховеру кнопку в первой колонке и в меню по свайпу.
 * @remark
 * См. <a href="/materials/demo-ws4-edit-arrow">демо-пример</a>
 * Чтобы кнопка отображалась в прикладном шаблоне колонки, следует самостоятельно встроить шаблон {@link Controls/grid:ColumnTemplate#editArrowTemplate} в нужное место.
 * @example
 * <pre>
 * <ws:partial template="{{editArrowTemplate}}" itemData="{{itemData}}"/>
 * </pre>
 */

/*
 * @name Controls/_grid/interface/IGridControl#showEditArrow
 * @cfg {Boolean} Allows showing button in first column on hover and in swipe menu.
 * <a href="/materials/demo-ws4-edit-arrow">Example</a>
 * @remark To place the button in the user column template, you should use the editArrowTemplate
 * @example
 * <ws:partial template="{{editArrowTemplate}}" itemData="{{itemData}}"/>
 */

/**
 * @event Происходит при клике на элемент списка.
 * @name Controls/_grid/interface/IGridControl#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} event Объект события.
 * @param {Types/entity:Record} item Элемент, по которому кликнули.
 * @param {Object} nativeEvent Объект нативного события браузера.
 * @param {Number} columnIndex Индекс колонки по которой кликнули.
 */

/*
* @event Occurs when list item is clicked.
* @name Controls/_grid/interface/IGridControl#itemClick
* @param {Vdom/Vdom:SyntheticEvent} event Event object.
* @param {Types/entity:Record} item Clicked item.
* @param {Object} nativeEvent Native event object.
* @param {Number} columnIndex Clicked column index.
*/

/**
 * @event Происходит при клике на "шеврон" элемента.
 * @name Controls/_grid/interface/IGridControl#editArrowClick
 * @param {Vdom/Vdom:SyntheticEvent} event Объект события.
 * @param {Types/entity:Model} item Элемент, по которому произвели клик.
 */
