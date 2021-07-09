import { IList } from 'Controls/baseList';
import { TColumns } from './IColumn';
import { IHeaderCell } from './IHeaderCell';

type HeaderVisibility = 'hasdata' | 'visible';

/**
 * Интерфейс для контрола {@link Controls/grid:View Таблица}.
 * @public
 * @author Авраменко А.С.
 */
export interface IGridControl extends IList {
    columns: TColumns;
    header?: IHeaderCell[];
    headerVisibility?: HeaderVisibility;
}

/*
 * Interface for Grid (table view).
 *
 * @interface Controls/_grid/display/interface/IGridControl
 * @public
 * @author Авраменко А.С.
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#ladderProperties
 * @cfg {Array.<String>} Массив с именами полей, по которым строится {@link /doc/platform/developmentapl/interface-development/controls/list/grid/ladder/ лесенка}.
 * @demo Controls-demo/gridNew/Ladder/Sticky/Index В демо-примере настроено отображение данных "лесенкой" для свойств "photo" и "date". Дополнительно включено прилипание заголовка таблицы, а также прилипание по первой колонке (см. {@link Controls/grid:IColumn#stickyProperty stickyProperty}).
 * @demo Controls-demo/gridNew/LadderStickyMultiline/StickyMultiline/Index В демо-примере настроено отображение данных "лесенкой" для свойств "date" и "time". Дополнительно включено прилипание по первой колонке.
 * @example
 * <pre class="brush: js">
 * protected _ladderProperties: string[] = ['date', 'time'];
 * </pre>
 * <pre class="brush: html; highlight: [6]">
 * <Controls.grid:View
 *     keyProperty="id"
 *     source="{{_viewSource}}"
 *     columns="{{_columns}}"
 *     header="{{_header}}"
 *     ladderProperties="{{_ladderProperties}}"/>
 * </pre>
 * @remark
 * Подробнее о конфигурации лесенки читайте в {@link /doc/platform/developmentapl/interface-development/controls/list/grid/ladder/ руководстве разработчика}.
 * @see Controls/grid:IColumn#stickyProperty
 * @markdown
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#ladderProperties
 * @cfg {Array.<String>} Array of fields that should be sticky.
 * @demo Controls-demo/gridNew/Ladder/Sticky/Index
 * @demo Controls-demo/gridNew/LadderStickyMultiline/StickyMultiline/Index
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
 *                                  {{template.item.contents['date']}}
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

/**
 * @name Controls/_grid/display/interface/IGridControl#header
 * @cfg {Array.<Controls/grid:IHeaderCell>} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/ шапки} таблицы.
 * @demo Controls-demo/gridNew/Header/Default/Index
 * @example
 * Пример 1. Для первой ячейки задаём пользовательский шаблон.
 * <pre class="brush: html; highlight: [2,3,4,5,6,7,8]">
 *    <Controls.grid:View>
 *       <ws:header>
 *          <ws:Array>
 *              <ws:template>
 *                  <ws:partial template="Controls/grid:HeaderContent" attr:class="controls-Grid__cell_spacing_money"  scope="{{_options}}" />
 *              </ws:template>
 *          </ws:Array>
 *       </ws:header>
 *    </Controls.grid:View>
 * </pre>
 * @example
 * Пример 2. Настройка опции задаётся в хуке и передаётся в шаблон.
 * <pre class="brush: js">
 * _header: null,
 * _beforeMount: function(options) {
 *    this._header = [
 *       {
 *          caption: 'Name',
 *          startRow: 1,
 *          endRow: 3,
 *          startColumn: 1,
 *          endColumn: 2
 *       },
 *       {
 *          caption: 'Price',
 *          startRow: 1,
 *          endRow: 2,
 *          startColumn: 2,
 *          endColumn: 4
 *       },
 *       {
 *          caption: 'Cell',
 *          startRow: 2,
 *          endRow: 3,
 *          startColumn: 2,
 *          endColumn: 3
 *       },
 *       {
 *          caption: 'Residue',
 *          startRow: 2,
 *          endRow: 3,
 *          startColumn: 3,
 *          endColumn: 4
 *       }
 *    ]
 * }
 * </pre>
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#header
 * @cfg {Array.<HeaderCell>} Describes grid's header.
 * @demo Controls-demo/gridNew/Header/Default/Index
 * @remark
 * Base header content template for Controls/grid:View: "Controls/grid:HeaderContent".
 * @example
 * Add header text spacing for columns with money fields:
 * <pre>
 *    <ws:partial template="Controls/grid:HeaderContent" attr:class="controls-Grid__cell_spacing_money" scope="{{_options}}" />
 * </pre>
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#columns
 * @cfg {Array.<Controls/grid:IColumn>} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/grid/columns/ колонок} таблицы.
 * @remark
 * Если при отрисовске контрола данные не отображаются или выводится только их часть, то следует проверить {@link Controls/collection:RecordSet}, полученный от {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}.
 * Такой RecordSet должен содержать набор полей, которые заданы в конфигурации контрола в опции columns, а также сами данные для каждого поля.
 * @example
 * <pre class="brush: js">
 * _columns: null,
 * _beforeMount: function() {
 *    this._columns = [
 *       {
 *          displayProperty: 'name',
 *          width: '1fr',
 *          align: 'left',
 *          template: _customNameTemplate
 *       },
 *       {
 *          displayProperty: 'balance',
 *          align: 'right',
 *          width: 'auto',
 *          resutTemplate: _customResultTemplate,
 *          result: 12340
 *       }
 *    ];
 * }
 * </pre>
 * <pre class="brush: html">
 *  <Controls.grid:View columns="{{_columns}}" />
 * </pre>
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#columns
 * @cfg {TColumns} Describes grid's columns.
 * @remark Before rendering, make sure that {@link Controls/display:Collection Collection} contains required data, when the {@link Controls/_grid/display/interface/IGridControl#columns columns} option changes. Call asynchronous 'reload' method before changing {@link Controls/_grid/display/interface/IGridControl#columns columns} option, if necessary.
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
 * @typedef {Array} IFooterColumn
 * @description Свойства объектов в опции {@link footer}.
 * @property {Number} [startColumn=undefined] Индекс колонки таблицы, с которой начинается ячейка подвала. Если поле не определено, тогда берется endColumn предыдущей ячейки или 1 (если это первая колонка).
 * @property {Number} [endColumn=undefined] Индекс колонки таблицы, на которой заканчивается ячейка подвала. Если поле не определено, тогда берется startColumn текущей ячейки, увеличенный на один.
 * @property {String|TemplateFunction} [template=undefined] Шаблон содержимого колонки подвала. Если поле не определено, тогда содержимое колонки будет пустым.
 * @remark
 * Значения опций startColumn и endColumn задаются в соответствии с GridLayout CSS, т.е. с единицы. Индексы считаются по границам колонок.
 * Например, чтобы отобразить объединенную ячейку подвала под второй и третей колонкой таблицы, нужно задать startColumn и endColumn в значения
 * 2 и 4 соответственно.
 * @public
 */

/*
 * @typedef {IFooterColumn}
 * @description Table footer column type.
 * @property {Number} [startColumn] The index of the table column that the footer cell starts with. An optional field, if undefined, is taken from the endColumn of the previous cell or 1 (if this is the first column).
 * @property {Number} [endColumn] The index of the table column that the footer cell ends with. An optional field, if undefined, the startColumn of the current cell is taken, incremented by one.
 * @property {Number} [template] Footer cell content template. Optional field, if undefined, cell content will be empty.
 * @remark
 * The startColumn and endColumn options are set according to the GridLayout CSS, i.e. from one. Indexes are calculated along the column boundaries.
 * For example, to display the merged footer cell under the second and third columns of the table, you need to set startColumn and endColumn to values
 * 2 and 4 respectively.
 * @public
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#footer
 * @cfg {Array.<IFooterColumn>} Конфигурация колонок {@link /doc/platform/developmentapl/interface-development/controls/list/grid/footer/ подвала таблицы}.
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#footer
 * @cfg {TColumns} Describes the columns in the footer of the table.
 * @example
 * <pre class="brush: js">
 * _columns: null,
 * _beforeMount: function() {
 *    this._columns = getGridColumns();
 *    // this._columns.length === 10
 * }
 * </pre>
 *
 * <pre class="brush: html">
 *  <Controls.grid:View ...>
 *      <ws:footer>
 *          <ws:Array>
 *              <ws:Object startColumn="{{ 2 }}">
 *                  <ws:template>
 *                      <div>Footer column 2 - 4</div>
 *                  </ws:template>
 *              </ws:Object>
 *              <ws:Object startColumn="{{ 4 }}" endColumn="{{ 6 }}">
 *                  <ws:template>
 *                      <div>Footer column 4 - 6</div>
 *                  </ws:template>
 *              </ws:Object>
 *              <ws:Object endColumn="{{ 8 }}" >
 *                  <ws:template>
 *                      <div>Footer column 6 - 8</div>
 *                  </ws:template>
 *              </ws:Object>
 *              </ws:Array>
 *          </ws:footer>
 *      </Controls.grid:View>
 * </pre>
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#stickyHeader
 * @cfg {Boolean} Закрепляет {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/ шапку} таблицы.
 * @demo Controls-demo/gridNew/Header/NoSticky/Index В демо-примере опция stickyHeader установлена в значение false.
 * @demo Controls-demo/gridNew/Header/Sticky/Index В демо-примере опция stickyHeader установлена в значение true.
 * @default true
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#stickyHeader
 * @cfg {Boolean} Fix the table header.
 * @demo Controls-demo/gridNew/Header/Sticky/Index
 * @demo Controls-demo/gridNew/Header/NoSticky/Index
 * @default true
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#columnScroll
 * @cfg {Boolean} Включает {@link /doc/platform/developmentapl/interface-development/controls/list/grid/horizontal-scrolling/ горизонтальную прокрутку} колонок.
 * @default false
 * @see Controls/_grid/display/interface/IGridControl#columnScrollStartPosition
 * @see Controls/_grid/display/interface/IGridControl#stickyColumnsCount
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#columnScroll
 * @cfg {Boolean} Enable column scroll.
 * @default false
 * @see Controls/_grid/display/interface/IGridControl#columnScrollStartPosition
 * @see Controls/_grid/display/interface/IGridControl#stickyColumnsCount
 */

/**
 * @typedef {String} Controls/_grid/display/interface/IGridControl/ColumnScrollStartPosition
 * @description Допустимые значения для опции {@link columnScrollStartPosition}.
 * @variant start Устанавливает горизонтальную прокрутку в начальное (крайнее левое) положение.
 * @variant end Устанавливает горизонтальную прокрутку в конечное (крайнее правое) положение.
 */

/*
 * @typedef {String} ColumnScrollStartPosition
 * @variant start Puts horizontal scroll into the leftmost position.
 * @variant end Puts horizontal scroll into the rightmost position.
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#columnScrollStartPosition
 * @cfg {Controls/_grid/display/interface/IGridControl/ColumnScrollStartPosition.typedef} Начальное положение {@link /doc/platform/developmentapl/interface-development/controls/list/grid/horizontal-scrolling/ горизонтальной прокрутки} колонок.
 * @default start
 * @see columnScroll
 * @see stickyColumnsCount
 * @see dragScrolling
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#columnScrollStartPosition
 * @cfg {Controls/_grid/display/interface/IGridControl/ColumnScrollStartPosition.typedef} Determines the starting columns scroll position if it is enabled.
 * @default start
 * @see Controls/_grid/display/interface/IGridControl#columnScroll
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#stickyColumnsCount
 * @cfg {Number} Количество зафиксированных колонок, которые не двигаются при {@link /doc/platform/developmentapl/interface-development/controls/list/grid/horizontal-scrolling/ горизонтальной прокрутке}.
 * @default 1
 * @remark
 * Колонка с чекбоксами {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/ множественного выбора} всегда зафиксирована и не входит в число stickyColumnsCount.
 * @demo Controls-demo/gridNew/ColumnScroll/Base/Index
 * @see columnScroll
 * @see columnScrollStartPosition
 * @see dragScrolling
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#stickyColumnsCount
 * @cfg {Number} Determines the number of fixed columns that do not move during horizontal scroll.
 * @default 1
 * @see Controls/_grid/display/interface/IGridControl#columnScroll
 * @remark
 * Multiple selection column is always fixed and does not count towards this number.
 * @demo Controls-demo/gridNew/ColumnScroll/Base/Index
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#dragScrolling
 * @cfg {Boolean} Включает скроллирование колонок перетаскиванием при {@link /doc/platform/developmentapl/interface-development/controls/list/grid/horizontal-scrolling/ горизонтальной прокрутке}.
 * @remark По умолчанию прокрутка колонок перетаскиванием включена, если в списке нет Drag'N'Drop записей.
 * @default true
 * @see columnScroll
 * @see stickyColumnsCount
 * @see columnScrollStartPosition
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#dragScrolling
 * @cfg {Boolean} Enable column drag scrolling in grid with column scroll.
 * @remark By default, column scrolling by drag and drop is enabled if there are no items Drag'N'Drop in the list.
 * @default true
 */

// TODO: Удалить по задаче https://online.sbis.ru/opendoc.html?guid=2c5630f6-814a-4284-b3fb-cc7b32a0e245.
/**
 * @name Controls/_grid/display/interface/IGridControl#rowSeparatorVisibility
 * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена. Используйте опцию {@link Controls/grid:IGridControl#rowSeparatorSize rowSeparatorSize}.
 * @cfg {Boolean} Видимость разделителей строк.
 * @default false
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#rowSeparatorVisibility
 * @cfg {Boolean} Allows to visible or hide row separator.
 * @deprecated
 * @default false
 */

/**
 * @typedef {String} Controls/_grid/display/interface/IGridControl/RowSeparatorSize
 * @description Значения для опции {@link rowSeparatorSize}.
 * @variant s Тонкая линия-разделитель.
 * @variant l Толстая линия-разделитель.
 * @variant null Линия-разделитель не отображается.
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#rowSeparatorSize
 * @cfg {Controls/_grid/display/interface/IGridControl/RowSeparatorSize.typedef|null} Толщина линии-разделителя строк.
 * @default null
 * @remark В значении null линия-разделители не отображается.
 * @see columnSeparatorSize
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#rowSeparatorSize
 * @cfg {RowSeparatorSize} set row separator height.
 * @variant s Thin row separator line.
 * @variant l Wide row separator line.
 * @variant null Without row separator line
 * @default null
 */

/**
 * @typedef {String} Controls/_grid/display/interface/IGridControl/ColumnSeparatorSize
 * @variant s Тонкая линия-разделитель.
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#columnSeparatorSize
 * @cfg {Controls/_grid/display/interface/IGridControl/ColumnSeparatorSize.typedef} Толщина {@link /doc/platform/developmentapl/interface-development/controls/list/grid/separator/#column линии-разделителя колонок}.
 * @remark В значении null линия-разделители не отображается.
 * @default null
 * @see rowSeparatorSize
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#columnSeparatorSize
 * @cfg {RowSeparatorSize} set column separator height.
 * @variant s Thin column separator line.
 * @variant null Without column separator line
 * @default null
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#resultsTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон отображения {@link /doc/platform/developmentapl/interface-development/controls/list/grid/results/ строки итогов}.
 * @default undefined
 * @demo Controls-demo/gridNew/Results/ResultsTemplate/Index
 * @markdown
 * @remark
 * Позволяет установить пользовательский шаблон отображения строки итогов (именно шаблон, а не контрол!). При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона Controls/grid:ResultsTemplate.
 *
 * В разделе "Примеры" показано как с помощью директивы {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial} задать пользовательский шаблон. Также в опцию resultsTemplate можно передавать и более сложные шаблоны, которые содержат иные директивы, например {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-if ws:if}. В этом случае каждая ветка вычисления шаблона должна заканчиваться директивой ws:partial, которая встраивает Controls/grid:ResultTemplate.
 *
 * Дополнительно о работе с шаблоном вы можете прочитать в {@link /doc/platform/developmentapl/interface-development/controls/list/grid/results/template/ руководстве разработчика}.
 *
 * Для отображения строки итогов необходимо задать значение в опции {@link resultsPosition}.
 * @example
 * <pre class="brush: html;">
 * <Controls.grid:View source="{{_viewSource}}" columns="{{_columns}}">
 *     <ws:resultsTemplate>
 *         <ws:partial template="Controls/grid:ResultsTemplate" scope="{{_options}}">
 *             <ws:contentTemplate>
 *                 <div>Итого: 2 страны с населением более миллиарда человек</div>
 *             </ws:contentTemplate>
 *         </ws:partial>
 *     </ws:resultsTemplate>
 * </Controls.grid:View>
 * </pre>
 * @see resultsPosition
 * @see resultsVisibility
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#resultsTemplate
 * @cfg {Function} Results row template.
 * @default Controls/grid:ResultsTemplate
 * @see resultsPosition
 * @see resultsVisibility
 */

/**
 * @typedef {String} Controls/_grid/display/interface/IGridControl/ResultsPosition
 * @description Значения для опции {@link resultsPosition}.
 * @variant top Над списком.
 * @variant bottom Под списком.
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#resultsPosition
 * @cfg {Controls/_grid/display/interface/IGridControl/ResultsPosition.typedef|undefined} Позиция отображения {@link /doc/platform/developmentapl/interface-development/controls/list/grid/results/ строки итогов}.
 * @default undefined
 * @demo Controls-demo/gridNew/Results/ResultsPosition/Index
 * @remark
 * В значении undefined строка итогов скрыта.
 * @result
 * @see resultsTemplate
 * @see resultsVisibility
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#resultsPosition
 * @cfg {String} Results row position.
 * @variant top Show results above the list.
 * @variant bottom Show results below the list.
 */

/**
 * @typedef {String} Controls/_grid/display/interface/IGridControl/ResultsVisibility
 * @description Допустимые значения для опции {@link resultsVisibility}.
 * @variant hasdata Отображается при наличии более 1 элемента в таблице.
 * @variant visible Отображается при наличии хотя бы 1 элемента в таблице.
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#resultsVisibility
 * @cfg {Controls/_grid/display/interface/IGridControl/ResultsVisibility.typedef} Отображение {@link /doc/platform/developmentapl/interface-development/controls/list/grid/results/ строки итогов} при наличии или отсутствии элементов.
 * @demo Controls-demo/gridNew/Results/FromMeta/Index
 * @remark
 * Для отображения строки итогов необходимо задать значение в опции {@link resultsPosition}.
 * @default hasdata
 * @see resultsTemplate
 * @see resultsPosition
 */

/**
 * @typedef {String} Controls/_grid/display/interface/IGridControl/HeaderVisibility
 * @description Допустимые значения для опции {@link headerVisibility}.
 * @variant hasdata Отображается при наличии элементов в таблице.
 * @variant visible Отображается всегда, вне зависимости от количества элементов в таблице.
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#headerVisibility
 * @cfg {Controls/_grid/display/interface/IGridControl/HeaderVisibility.typedef} Отображение {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/ шапки} при наличии или отсутствии элементов.
 * @demo Controls-demo/gridNew/Header/HeaderVisibility/Index
 * @default hasdata
 */


/**
 * @name Controls/_grid/display/interface/IGridControl#editArrowVisibilityCallback
 * @cfg {Function} Функция обратного вызова для управления видимостью кнопки редактирования.
 * @remark
 * Первый и единственный аргумент функции - запись таблицы, для которой вызвана функция.
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#colspanCallback
 * @cfg {Function} Функция обратного вызова для расчёта объединения колонок строки (колспана).
 * @remark
 * Аргументы функции:
 * * {Types/entity:Model} item Элемент, для которого рассчитывается объединение.
 * * {Controls/grid:IColumn} column Колонка таблицы.
 * * {Number} columnIndex Индекс колонки таблицы.
 * * {Boolean} isEditing Актуальное состояние редактирования элемента.
 *
 * Функция возвращает {Controls/grid:TColspanCallbackResult} - количество объединяемых колонок, учитывая текущую. Для объединения всех колонок, начиная с текущей, из функции нужно вернуть специальное значение 'end'.
 * @markdown
 * @see resultsColspanCallback
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#resultsColspanCallback
 * @cfg {Function} Функция обратного вызова для расчёта объединения колонок {@link /doc/platform/developmentapl/interface-development/controls/list/grid/results/ строки итого}.
 * @remark
 * Аргументы функции:
 * * {Controls/grid:IColumn} column Колонка таблицы.
 * * {Number} columnIndex Индекс колонки таблицы.
 *
 * Функция возвращает Controls/grid:TColspanCallbackResult - количество объединяемых колонок, учитывая текущую. Для объединения всех колонок, начиная с текущей, из функции нужно вернуть специальное значение "end".
 * @markdown
 * @see colspanCallback
 */


/**
 * @typedef {Object} Controls/_grid/display/interface/IGridControl/IEmptyTemplateColumn
 * @description
 * Объект конфигурации колонки представления пустой таблицы.
 * @param {TemplateFunction} template Элемент, для которого рассчитывается объединение.
 * @param {Number} startColumn Начальный индекс колонки.
 * @param {Number} endColumn Конечный индекс колонки.
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#emptyTemplateColumns
 * @cfg {Array.<Controls/_grid/display/interface/IGridControl/IEmptyTemplateColumn.typedef>} Конфигурация колонок {@link /doc/platform/developmentapl/interface-development/controls/list/grid/empty-grid/#empty-template-columns пустой таблицы}.
 * @demo Controls-demo/gridNew/EmptyGrid/Editing/Index
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#showEditArrow
 * @cfg {Boolean} Видимость кнопки, которая отображается в первой колонке при наведении курсора.
 * @remark
 * Чтобы стрелка отобразилась в прикладном шаблоне ячейки, необходимо в опции {@link Controls/grid:ColumnTemplate#contentTemplate contentTemplate} явно указать позицию стрелки. Для этого используется переменная editArrowTemplate из области видимости самого шаблона. Пример использования посмотрите {@link Controls/grid:ColumnTemplate#contentTemplate тут}.
 *
 * **Обратите внимание!** Для отображения стрелки по свайпу необходимо всегда указывать опцию showEditArrow=true, вне зависимости от того, используется прикладной шаблон или нет.
 * @demo Controls-demo/gridNew/ShowEditArrow/Index
 * @example
 * <pre class="brush: html; highlight: [5,12]">
 * <!-- WML -->
 * <Controls.grid:View
 *     keyProperty="id"
 *     source="{{_viewSource}}"
 *     showEditArrow="{{true}}">
 *     <ws:columns>
 *         <ws:Array>
 *             <ws:Object>
 *                  <ws:template>
 *                      <ws:partial template="Controls/grid:ColumnTemplate">
 *                          <ws:contentTemplate>
 *                              <ws:partial template="{{editArrowTemplate}}" scope="{{contentTemplate}}"/>
 *                          </ws:contentTemplate>
 *                      </ws:partial>
 *                  </ws:template>
 *             </ws:Object>
 *         </ws:Array>
 *     </ws:columns>
 * </Controls.grid:View>
 * </pre>
 */

/*
 * @name Controls/_grid/display/interface/IGridControl#showEditArrow
 * @cfg {Boolean} Allows showing button in first column on hover and in swipe menu.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTree%2FEditArrow">Example</a>
 * @remark To place the button in the user column template, you should use the editArrowTemplate
 * @demo Controls-demo/gridNew/ShowEditArrow/Index
 * @example
 * <ws:partial template="{{editArrowTemplate}}" itemData="{{itemData}}"/>
 */

/**
 * @name Controls/_grid/display/interface/IGridControl#itemEditorTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон, используемый в таблице для {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования строки по месту} без деления на ячейки.
 * @default undefined
 * @remark
 * При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/grid:ItemEditorTemplate}.
 * Если опция определена, то в таблице будет использоваться {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/template/#string расширенное редактирование строк}.
 * Подробнее об настройке шаблона читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/template/#item-editor-template здесь}.

 */

/**
 * @event Происходит при наведении курсора мыши на ячейку таблицы.
 * @name Controls/_grid/display/interface/IGridControl#hoveredCellChanged
 * @param {UICommon/Events:SyntheticEvent} event Объект события.
 * @param {Types/entity:Record} item Элемент, на который навели курсор.
 * @param {HTMLElement} itemContainer Контейнер элемента, на который навели курсор.
 * @param {Number} columnIndex Индекс ячейки, на которую навели курсор.
 * @param {HTMLElement} cellContainer Контейнер ячейки элемента, на которую навели курсор.
 */

/**
 * @event Происходит при клике на "шеврон" элемента.
 * @name Controls/_grid/display/interface/IGridControl#editArrowClick
 * @param {UICommon/Events:SyntheticEvent} event Объект события.
 * @param {Types/entity:Model} item Элемент, по которому произвели клик.
 */

/**
 * @event Происходит при клике на {@link /doc/platform/developmentapl/interface-development/controls/list/grid/columns/visual/tag/ тег} внутри ячейки таблицы.
 * @name Controls/_grid/display/interface/IGridControl#tagClick
 * @param {Object} event Нативное событие. Может быть использовано для получения тега как DOM-элемента для отображения инфобокса.
 * @remark Событие никогда не запустится, если вы не укажете опцию {@link Controls/grid:ColumnTemplate#tagStyle tagStyle} шаблона колонки или {@link Controls/grid:IColumn#tagStyleProperty tagStyleProperty} у колонки.
 * @see tagStyle
 * @see tagHover
 */

/**
 * @event Происходит при наведении курсора мыши на {@link /doc/platform/developmentapl/interface-development/controls/list/grid/columns/visual/tag/ тег} внутри ячейки таблицы.
 * @name Controls/_grid/display/interface/IGridControl#tagHover
 * @param {Object} event Нативное событие. Может быть использовано для получения тега как DOM-элемента для отображения инфобокса.
 * @remark Событие никогда не запустится, если вы не укажете опцию {@link Controls/grid:ColumnTemplate#tagStyle tagStyle} шаблона колонки или {@link Controls/grid:IColumn#tagStyleProperty tagStyleProperty} у колонки.
 * @see tagClick
 */
