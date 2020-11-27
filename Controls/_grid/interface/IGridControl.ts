/**
 * Интерфейс для контрола {@link Controls/grid:View Таблица}.
 *
 * @interface Controls/_grid/interface/IGridControl
 * @public
 * @author Авраменко А.С.
 */
export interface IGridControl {};
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
 * @demo Controls-demo/grid/Ladder/Sticky/Index В демо-примере настроено отображение данных "лесенкой" для свойств "photo" и "date". Дополнительно включено прилипание заголовка таблицы, а также прилипание по первой колонке (см. {@link Controls/grid:IColumn#stickyProperty stickyProperty}).
 * @demo Controls-demo/grid/LadderStickyMultiline/StickyMultiline/Index В демо-примере настроено отображение данных "лесенкой" для свойств "date" и "time". Дополнительно включено прилипание по первой колонке.
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
 * @remark Подробнее о конфигурации лесенки читайте в <a href="/doc/platform/developmentapl/interface-development/controls/list/grid/ladder/">руководстве разработчика</a>.
 * @see Controls/grid:IColumn#stickyProperty
 */

/*
 * @name Controls/_grid/interface/IGridControl#ladderProperties
 * @cfg {Array.<String>} Array of fields that should be sticky.
 * @demo Controls-demo/grid/Ladder/Sticky/Index
 * @demo Controls-demo/grid/LadderStickyMultiline/StickyMultiline/Index
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

/**
 * @name Controls/_grid/interface/IGridControl#header
 * @cfg {Controls/grid:IHeaderCell} Конфигурация заголовка таблицы.
 * @remark
 * В качестве значения опция принимает массив объектов, в которых задают конфигурацию для ячеек заголовка.
 * Для одноуровневого заголовка первый объект массива задаёт конфигурацию для первой ячейки.
 * Условно ячейки заголовка нумеруются слева направо.
 * Для многоуровневого заголовка порядок объектов массива не соответствует конфигурируемой ячейке.
 * Подробнее о работе с заголовком таблицы читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/grid/header/">здесь</a>.
 * @demo Controls-demo/grid/Header/Default/Index
 * @example
 * Пример 1. Для первой ячейки задаём пользовательский шаблон.
 * <pre class="brush: html; highlight: [2,3,4,5,6,7,8]">
 *    <Controls.grid:View>
 *       <ws:header>
 *          <ws:Array>
 *              <ws:template>
 *                  <ws:partial template="Controls/grid:HeaderContent" attr:class="controls-Grid__cell_spacing_money" colData="{{colData}}" />
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
 * @name Controls/_grid/interface/IGridControl#header
 * @cfg {Array.<HeaderCell>} Describes grid's header.
 * @demo Controls-demo/grid/Header/Default/Index
 * @remark
 * Base header content template for Controls/grid:View: "Controls/grid:HeaderContent".
 * @example
 * Add header text spacing for columns with money fields:
 * <pre>
 *    <ws:partial template="Controls/grid:HeaderContent" attr:class="controls-Grid__cell_spacing_money" colData="{{colData}}" />
 * </pre>
 */

/**
 * @name Controls/_grid/interface/IGridControl#columns
 * @cfg {Array.<Controls/grid:IColumn>} Описывает колонки таблицы.
 * @remark
 * Если при отрисовске контрола данные не отображаются или выводится только их часть, то следует проверить {@link Controls/collection:RecordSet}, полученный от источника данных.
 * Такой RecordSet должен содержать набор полей, которые заданы в конфигурации контрола в опции columns, а также сами данные для каждого поля.
 *
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
 * @name Controls/_grid/interface/IGridControl#columns
 * @cfg {TColumns} Describes grid's columns.
 * @remark Before rendering, make sure that {@link Controls/display:Collection Collection} contains required data, when the {@link Controls/_grid/interface/IGridControl#columns columns} option changes. Call asynchronous 'reload' method before changing {@link Controls/_grid/interface/IGridControl#columns columns} option, if necessary.
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
 * @typedef {IFooterColumn}
 * @description Тип колонки подваалов таблицы
 * @property {Number} [startColumn] Индекс колонки таблицы, с которой начинается ячейка подвала. Необязательное поле, если неопределено, берется endColumn предыдущей ячейки или 1(если это первая колонка).
 * @property {Number} [endColumn] Индекс колонки таблицы, на которой заканчивается ячейка подвала. Необязательное поле, если неопределено, берется startColumn текущей ячейки увеличенный на один.
 * @property {Number} [template] Шаблон содержимого ячейки подвала. Необязательное поле, если неопределено, содержимое ячейки будет пустым.
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
 * @name Controls/_grid/interface/IGridControl#footer
 * @cfg {Array.<IFooterColumn>} Описывает колонки подвала таблицы.
 * @example
 * В примере показана настройка колонок подвала для таблицы с десятью колонками.
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

/*
 * @name Controls/_grid/interface/IGridControl#footer
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
 * @name Controls/_grid/interface/IGridControl#stickyHeader
 * @cfg {Boolean} Закрепляет заголовок таблицы.
 * @demo Controls-demo/grid/Header/NoSticky/Index В демо-примере опция stickyHeader установлена в значение false.
 * @demo Controls-demo/grid/Header/Sticky/Index В демо-примере опция stickyHeader установлена в значение true.
 * @default true
 */

/*
 * @name Controls/_grid/interface/IGridControl#stickyHeader
 * @cfg {Boolean} Fix the table header.
 * @demo Controls-demo/grid/Header/Sticky/Index
 * @demo Controls-demo/grid/Header/NoSticky/Index
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
 * @typedef {String} ColumnScrollStartPosition
 * @variant start Устанавливает горизонтальную прокрутку в начальное (крайнее левое) положение.
 * @variant end Устанавливает горизонтальную прокрутку в конечное (крайнее правое) положение.
 */

/*
 * @typedef {String} ColumnScrollStartPosition
 * @variant start Puts horizontal scroll into the leftmost position.
 * @variant end Puts horizontal scroll into the rightmost position.
 */

/**
 * @name Controls/_grid/interface/IGridControl#columnScrollStartPosition
 * @cfg {ColumnScrollStartPosition} Определяет начальное положение горизонтальной прокрутки колонок, если она включена.
 * @default start
 * @see Controls/_grid/interface/IGridControl#columnScroll
 */

/*
 * @name Controls/_grid/interface/IGridControl#columnScrollStartPosition
 * @cfg {ColumnScrollStartPosition} Determines the starting columns scroll position if it is enabled.
 * @default start
 * @see Controls/_grid/interface/IGridControl#columnScroll
 */

/**
 * @name Controls/_grid/interface/IGridControl#stickyColumnsCount
 * @cfg {Number} Количество зафиксированных колонок, которые не двигаются при горизонтальном скролле.
 * @default 1
 * @see Controls/_grid/interface/IGridControl#columnScroll
 * @remark
 * Столбец флагов множественного выбора всегда зафиксирован, и не входит в число stickyColumnsCount.
 * @demo Controls-demo/grid/ColumnScroll/Base/Index
 */

/*
 * @name Controls/_grid/interface/IGridControl#stickyColumnsCount
 * @cfg {Number} Determines the number of fixed columns that do not move during horizontal scroll.
 * @default 1
 * @see Controls/_grid/interface/IGridControl#columnScroll
 * @remark
 * Multiple selection column is always fixed and does not count towards this number.
 * @demo Controls-demo/grid/ColumnScroll/Base/Index
 */

/**
 * @name Controls/_grid/interface/IGridControl#dragScrolling
 * @cfg {Boolean} Включает скроллирование колонок перетаскиванием при горизонтальном скролле.
 * @remark По-умолчанью скроллирование колонок перетаскиванием включено если в списке нет Drag'N'Drop записей.
 * @default true
 */

/*
 * @name Controls/_grid/interface/IGridControl#dragScrolling
 * @cfg {Boolean} Enable column drag scrolling in grid with column scroll.
 * @remark By default, column scrolling by drag and drop is enabled if there are no items Drag'N'Drop in the list.
 * @default true
 */

// TODO: Удалить по задаче https://online.sbis.ru/opendoc.html?guid=2c5630f6-814a-4284-b3fb-cc7b32a0e245.
/**
 * @name Controls/_grid/interface/IGridControl#rowSeparatorVisibility
 * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена. Используйте опцию {@link Controls/grid:IGridControl#rowSeparatorSize rowSeparatorSize}.
 * @cfg {Boolean} Позволяет отображать/скрывать разделитель строк.
 * @default false
 */

/*
 * @name Controls/_grid/interface/IGridControl#rowSeparatorVisibility
 * @cfg {Boolean} Allows to visible or hide row separator.
 * @deprecated
 * @default false
 */

/**
 * @name Controls/_grid/interface/IGridControl#rowSeparatorSize
 * @cfg {Enum} Высота линии-разделителя строк.
 * @variant s Размер тонкой линии-разделителя.
 * @variant l Размер толстой линии-разделителя.
 * @variant null Без линии-разделителя.
 * @default null
 * @default s
 */

/*
 * @name Controls/_grid/interface/IGridControl#rowSeparatorSize
 * @cfg {RowSeparatorSize} set row separator height.
 * @variant s Thin row separator line.
 * @variant l Wide row separator line.
 * @variant null Without row separator line
 * @default null
 */

/**
 * @name Controls/_grid/interface/IGridControl#columnSeparatorSize
 * @cfg {Enum} Ширина линии-разделителя колонок.
 * @variant s Размер тонкой линии-разделителя.
 * @variant null Без линии-разделителя.
 * @default null
 */

/*
 * @name Controls/_grid/interface/IGridControl#columnSeparatorSize
 * @cfg {RowSeparatorSize} set column separator height.
 * @variant s Thin column separator line.
 * @variant null Without column separator line
 * @default null
 */

/**
 * @name Controls/_grid/interface/IGridControl#resultsTemplate
 * @cfg {Function} Шаблон отображения строки итогов.
 * @default undeined
 * @demo Controls-demo/grid/Results/ResultsTemplate/Index
 * @remark
 * Позволяет установить пользовательский шаблон отображения строки итогов (именно шаблон, а не контрол!). При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона Controls/grid:ResultsTemplate.
 *
 * В разделе "Примеры" показано как с помощью директивы {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial} задать пользовательский шаблон. Также в опцию resultsTemplate можно передавать и более сложные шаблоны, которые содержат иные директивы, например {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-if ws:if}. В этом случае каждая ветка вычисления шаблона должна заканчиваться директивой ws:partial, которая встраивает Controls/grid:ResultTemplate.
 *
 * Дополнительно о работе с шаблоном вы можете прочитать в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/results/row/ руководстве разработчика}.
 *
 * Для отображения строки итогов необходимо задать значение в опции {@link resultsPosition}.
 * @example
 * <pre class="brush: html;">
 * <Controls.grid:View>
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
 * @name Controls/_grid/interface/IGridControl#resultsTemplate
 * @cfg {Function} Results row template.
 * @default Controls/grid:ResultsTemplate
 * @see resultsPosition
 * @see resultsVisibility
 */

/**
 * @typedef {String} ResultsPosition
 * @variant top Над списком.
 * @variant bottom Под списком.
 */

/**
 * @name Controls/_grid/interface/IGridControl#resultsPosition
 * @cfg {ResultsPosition|undefined} Положение строки итогов.
 * @default undefined
 * @demo Controls-demo/grid/Results/ResultsPosition/Index
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
 * @typedef {String} ResultsVisibility
 * @variant hasdata Отображается при наличии более 1 записи в списке.
 * @variant visible Отображается всегда, вне зависимости от количества записей в списке.
 */

/**
 * @typedef {String} HeaderVisibility
 * @variant hasdata Отображается при наличии данных в списке.
 * @variant visible Отображается всегда, вне зависимости от количества записей в списке.
 */

/**
 * @name Controls/_grid/interface/IGridControl#resultsVisibility
 * @cfg {ResultsVisibility} Режим отображения строки итогов.
 * @demo Controls-demo/grid/Results/FromMeta/Index
 * @remark
 * Для отображения строки итогов необходимо задать значение в опции {@link resultsPosition}.
 * @default hasdata
 * @see resultsTemplate
 * @see resultsPosition
 */
/**
 * @name Controls/_grid/interface/IGridControl#headerVisibility
 * @cfg {HeaderVisibility} Режим отображения заголовков колонки.
 * @demo Controls-demo/grid/Header/HeaderVisibility/Index
 * @default hasdata
 */


/**
 * @name Controls/_grid/interface/IGridControl#editArrowVisibilityCallback
 * @cfg {TEditArrowVisibilityCallback} Функция обратного вызова для определения видимости кнопки открытия карточки в панели действий по свайпу для конкретной записи.
 * @param {Controls/_itemActions/interface/IItemAction/TEditArrowVisibilityCallback.typedef} TEditArrowVisibilityCallback
 * @remark
 * Первый и единственный аргумент - текущая запись, на которой открывается свайп.
 */

/**
 * @name Controls/_grid/interface/IGridControl#showEditArrow
 * @cfg {Boolean} Позволяет отображать по ховеру кнопку в первой колонке и в меню по свайпу.
 * @remark
 * Чтобы стрелка-шеврон отобразилась в прикладном шаблоне ячейки, необходимо в опции {@link Controls/grid:ColumnTemplate#contentTemplate} явно указать позицию стрелки-шеврона. Для этого используется переменная editArrowTemplate из области видимости самого шаблона. Пример использования посмотрите {@link Controls/grid:ColumnTemplate#contentTemplate тут}.
 * 
 * **Обратите внимание!** Для отображения стрелки-шеврона по свайпу необходимо всегда указывать опцию showEditArrow=true, вне зависимости от того,
 * используется прикладной шаблон или нет.
 * @demo Controls-demo/grid/ShowEditArrow/Index
 * @example
 * <pre>
 *    <ws:partial template="{{editArrowTemplate}}" itemData="{{itemData}}"/>
 * </pre>
 */

/*
 * @name Controls/_grid/interface/IGridControl#showEditArrow
 * @cfg {Boolean} Allows showing button in first column on hover and in swipe menu.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FTree%2FEditArrow">Example</a>
 * @remark To place the button in the user column template, you should use the editArrowTemplate
 * @demo Controls-demo/grid/ShowEditArrow/Index
 * @example
 * <ws:partial template="{{editArrowTemplate}}" itemData="{{itemData}}"/>
 */

/**
 * @event Происходит при наведении курсора мыши на ячейку таблицы.
 * @name Controls/_grid/interface/IGridControl#hoveredCellChanged
 * @param {Vdom/Vdom:SyntheticEvent} event Объект события.
 * @param {Types/entity:Record} item Элемент, на который навели курсор.
 * @param {HTMLElement} itemContainer Контейнер элемента, на который навели курсор.
 * @param {Number} columnIndex Индекс ячейки, на которую навели курсор.
 * @param {HTMLElement} cellContainer Контейнер ячейки элемента, на которую навели курсор.
 */

/**
 * @event Происходит при клике на "шеврон" элемента.
 * @name Controls/_grid/interface/IGridControl#editArrowClick
 * @param {Vdom/Vdom:SyntheticEvent} event Объект события.
 * @param {Types/entity:Model} item Элемент, по которому произвели клик.
 */

/**
 * @event Происходит при клике на тег внутри ячейки таблицы.
 * @name Controls/_grid/interface/IGridControl#tagClick
 * @param {Object} event Нативное событие. Может быть использовано для получения тега как DOM-элемента для отображения инфобокса.
 * @remark Событие никогда не запустится, если вы не укажете опцию {@link Controls/grid:ColumnTemplate#tagStyle tagStyle} шаблона колонки или {@link Controls/grid:ITagColumn#tagStyleProperty tagStyleProperty} у колонки.
 * @see tagStyle
 */

/**
 * @event Происходит при наведении курсора мыши на тег внутри ячейки таблицы.
 * @name Controls/_grid/interface/IGridControl#tagHover
 * @param {Object} event Нативное событие. Может быть использовано для получения тега как DOM-элемента для отображения инфобокса.
 * @remark Событие никогда не запустится, если вы не укажете опцию {@link Controls/grid:ColumnTemplate#tagStyle tagStyle} шаблона колонки или {@link Controls/grid:ITagColumn#tagStyleProperty tagStyleProperty} у колонки.
 * @see tagClick
 */
