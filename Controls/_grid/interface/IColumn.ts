import {TemplateFunction} from 'UI/Base';

/**
 * @typedef {IColumn[]}
 * @description Тип опции columns в таблице
 * @public
 */
export type TColumns = IColumn[];

/**
 * @typedef {String} TCellPaddingVariant
 * @description Возможные значения отступов внутри ячейки таблицы
 * @variant S Небольшой отступ.
 * @variant M Средний отступ.
 * @variant null Нулевой отступ.
 */
export type TCellPaddingVariant = 'S' | 'M' | 'null';

/**
 * @typedef {Object} ICellPadding
 * @description Опции для задания ячейкам левого и правого отступа, исключая левый отступ первой ячейки и правый последней.
 * @property {TCellPaddingVariant} [left=null] Отступ от левой границы ячейки.
 * @property {TCellPaddingVariant} [right=null] Отступ от правой границы ячейки.
 */
export interface ICellPadding {
    left?: TCellPaddingVariant;
    right?: TCellPaddingVariant;
}

/**
 * @typedef {String} TCellAlign
 * @description Значения для выравнивания ячеек по горизонтали.
 * @variant left По левому краю.
 * @variant center По центру.
 * @variant right По правому краю.
 */
export type TCellAlign = 'left' | 'center' | 'right';

/**
 * @typedef {String} TCellVerticalAlign
 * @description Значения для выравнивания ячеек по вертикали.
 * @variant top По верхнему краю.
 * @variant center По центру.
 * @variant bottom По нижнему краю.
 * @variant baseline По базовой линии.
 */
export type TCellVerticalAlign = 'top' | 'center' | 'bottom' | 'baseline';

/**
 * @typedef {String} TOverflow
 * @description Поведение текста, если он не умещается в ячейке
 * @variant ellipsis Текст обрезается многоточием.
 * @variant none Текст разбивается на несколько строк.
 */
export type TOverflow = 'ellipsis' | 'none';

/**
 * @typedef {Enum} TColumnSeparatorSize
 * @description Ширина линии-разделителя колонок.
 * @variant s Размер тонкой линии-разделителя.
 * @variant null Без линии-разделителя.
 */
type TColumnSeparatorSize = 's' | null;

/**
 * @typedef {Object} TColumnSeparatorSizeConfig
 * @description Ширина линии-разделителя колонок слева и справа.
 * @property {TColumnSeparatorSize} [left=null] Ширина линии-разделителя колонок слева.
 * @property {TColumnSeparatorSize} [right=null] Ширина линии-разделителя колонок справа.
 */
type TColumnSeparatorSizeConfig = {
    left?: TColumnSeparatorSize;
    right?: TColumnSeparatorSize;
};

export interface IColspanParams {
    startColumn?: number;
    endColumn?: number;
    colspan?: number;
}

export interface IRowspanParams {
    startRow?: number;
    endRow?: number;
    rowspan?: number;
}

/**
 * @typedef {String} TActionDisplayMode
 * @description Стиль тега
 * @variant info
 * @variant danger
 * @variant primary
 * @variant success
 * @variant warning
 * @variant secondary
 */
/*
 * @typedef {String} TActionDisplayMode
 * @variant info
 * @variant danger
 * @variant primary
 * @variant success
 * @variant warning
 * @variant secondary
 */
export type TTagStyle = 'info' | 'danger' | 'primary' | 'success' | 'warning' | 'secondary';

/**
 * Интерфейс для конфигурации колонки в контроле {@link Controls/grid:View Таблица}.
 *
 * @interface Controls/_grid/interface/IColumn
 * @public
 * @author Авраменко А.С.
 */
export interface IColumn extends IColspanParams, IRowspanParams {
    /**
     * @name Controls/_grid/interface/IColumn#width
     * @cfg {String} Ширина колонки.
     * @remark
     * В качестве значения свойства можно указать пиксели (px), проценты (%), доли (1fr), "auto", "minmax", "max-content" и "min-content".
     * В значении "auto" ширина колонки устанавливается автоматически исходя из типа и содержимого элемента.
     * В значении "minmax(,)" ширина колонки устанавливается автоматически в рамках заданного интервала. Например, "minmax(600px, 1fr)" означает, что минимальная ширина колонки 600px, а максимальная — 1fr.
     * В значении "max-content" ширина колонки устанавливается автоматически в зависимости от самой большой ячейки. Например, если в первой строке ширина ячейки 100px, а во второй строке — 200px, тогда ширина колонки будет определена как 200px.
     * В значении "min-content" для колонки устанавливается наименьшая возможная ширина, при которой не возникает переполнения ячейки. Например, если в первой строке ячейка содержит контент "Первая строка", а во второй — "Содержимое второй строки" и включен перенос по словам, то ширина рассчитается по наиболее широкому непереносимому слову, а это слово "Содержимое" из второй строки.
     * Для браузеров, которые не поддерживают технологию {@link https://developer.mozilla.org/ru/docs/web/css/css_grid_layout CSS Grid Layout}, не работает ширина колонки, указанная в долях, "auto" или "minmax". Для таких браузеров используйте свойство {@link compatibleWidth}.
     * При установке ширины фиксированным колонкам рекомендуется использовать абсолютные величины (px). От конфигурации ширины фиксированных колонок зависит ширина скроллируемой области. Например, при установке ширины фиксированной колонки 1fr её контент может растянуться на всю ширину таблицы, и в результате не останется свободного пространства для скролла.
     * @see compatibleWidth
     */
    width: string;
    /**
     * @name Controls/_grid/interface/IColumn#displayProperty
     * @cfg {String} Имя поля, данные которого отображаются в колонке.
     * @demo Controls-demo/grid/Columns/CellNoClickable/Index В демо-примере в конфигурации колонок заданы свойства displayProperty со значениями number, country и capital.
     * @example
     * <pre class="brush: html; highlight: [6,11,12]">
     * <Controls.grid:View
     *     keyProperty="id"
     *     source="{{_viewSource}}">
     *     <ws:columns>
     *         <ws:Array>
     *             <ws:Object displayProperty="number" width="40px">
     *                 <ws:template>
     *                     <ws:partial template="Controls/grid:ColumnTemplate" clickable="{{false}}" itemData="{{itemData}}"/>
     *                 </ws:template>
     *             </ws:Object>
     *             <ws:Object displayProperty="country" width="300px"/>
     *             <ws:Object displayProperty="capital" width="max-content" compatibleWidth="98px">
     *                 <ws:template>
     *                     <ws:partial template="Controls/grid:ColumnTemplate" clickable="{{false}}" itemData="{{itemData}}"/>
     *                 </ws:template>
     *             </ws:Object>
     *         </ws:Array>
     *     </ws:columns>
     * </Controls.grid:View>
     * </pre>
     * <pre class="brush: js; highlight: [8,9,10]">
     * protected _beforeMount(): void {
     *     this._viewSource = new Memory({
     *         keyProperty: 'id',
     *         // tslint:disable-next-line
     *         data: [
     *             {
     *                 id: 0,
     *                 number: 1,
     *                 country: 'Россия',
     *                 capital: 'Москва',
     *                 population: 143420300,
     *                 square: 17075200,
     *                 populationDensity: 8
     *             },
     *             ...
     *         ]
     *     });
     * }
     * </pre>
     * @see template
     */
    displayProperty?: string;
    /**
     * @name Controls/_grid/interface/IColumn#compatibleWidth
     * @cfg {String} Ширина колонки в браузерах, не поддерживающих {@link https://developer.mozilla.org/ru/docs/web/css/css_grid_layout CSS Grid Layout}.
     * @remark
     * В качестве значения свойства можно указать только пиксели (px) или проценты (%). Если свойство не задано, применяется значение "auto".
     * @demo Controls-demo/grid/Columns/CellNoClickable/Index В демо-примере в конфигурации третьей колонки свойство compatibleWidth установлено в значение 98px.
     * @see width
     */
    compatibleWidth?: string;
    /**
     * @name Controls/_grid/interface/IColumn#template
     * @cfg {String|Function} Шаблон отображения ячейки.
     * @default undefined
     * @remark
     * Позволяет установить пользовательский шаблон отображения ячейки (**именно шаблон**, а не контрол!). При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/grid:ColumnTemplate}.
     *
     * По умолчанию Controls/grid:ColumnTemplate отображает значение поля, имя которого задано в конфигурации колонки в свойстве {@link displayProperty}. Также шаблон Controls/grid:ColumnTemplate поддерживает {@link Controls/grid:ColumnTemplate параметры}, с помощью которых можно изменить отображение ячейки.
     *
     * При настройке пользовательского шаблона следует использовать директиву <a href="/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial">ws:partial</a>. Также в опцию template можно передавать и более сложные шаблоны, которые содержат иные директивы, например <a href="/doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-if">ws:if</a>. В этом случае каждая ветка вычисления шаблона должна заканчиваться директивой ws:partial, которая встраивает Controls/grid:ColumnTemplate.
     *
     * Дополнительно о работе с шаблоном вы можете прочитать в <a href="/doc/platform/developmentapl/interface-development/controls/list/grid/columns/template/">руководстве разработчика</a>.
     * @see Controls/grid:ColumnTemplate
     * @demo Controls-demo/grid/Columns/Template/Index В демо-примере в конфигурации первой колонки задан пользовательский шаблон отображения ячейки. В конфигурации шаблона переопределён контент ячейки в опции contentTemplate.
     * @example
     * В следующем примере показано, что шаблон отображения ячейки колонки задаётся из отдельного WML-файла.
     * <pre class="brush: js">
     * import * as countryRatingNumber from 'wml!Controls-demo/grid/resources/CellTemplates/CountryRatingNumber';
     * ...
     * protected _columns: IColumn[] = [
     *     {
     *         displayProperty: 'number',
     *         template: countryRatingNumber
     *     },
     *     ...
     * ]
     * </pre>
     *
     * <pre class="brush: html; highlight: [4]">
     * <Controls.grid:View
     *     keyProperty="id"
     *     source="{{_viewSource}}"
     *     columns="{{_columns}}" />
     * </pre>
     *
     * <pre class="brush: html">
     * <!-- CountryRatingNumber.wml -->
     * <ws:partial template="Controls/grid:ColumnTemplate" itemData="{{itemData}}">
     *     <ws:contentTemplate>
     *         <span style="color: #f60">№ {{itemData.item['number']}}</span>
     *     </ws:contentTemplate>
     * </ws:partial>
     * </pre>
     * @see resultTemplate
     */
    template?: TemplateFunction;
    /**
     * @name Controls/_grid/interface/IColumn#resultTemplate
     * @cfg {String|Function} Шаблон отображения ячейки в строке итогов.
     * @default undefined
     * @demo Controls-demo/grid/Results/FromMeta/CustomResultsCells/Index
     * @remark
     * Позволяет установить пользовательский шаблон отображения ячейки в строке итогов (именно шаблон, а не контрол!). При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/grid:ResultColumnTemplate}.
     *
     * Также шаблон {@link Controls/grid:ResultColumnTemplate} поддерживает параметры, с помощью которых можно изменить отображение ячейки.
     *
     * В разделе "Примеры" показано как с помощью директивы {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial} задать пользовательский шаблон. Также в опцию resultTemplate можно передавать и более сложные шаблоны, которые содержат иные директивы, например {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-if ws:if}. В этом случае каждая ветка вычисления шаблона должна заканчиваться директивой ws:partial, которая встраивает Controls/grid:ResultColumnTemplate.
     *
     * Дополнительно о работе с шаблоном вы можете прочитать в {@link /doc/platform/developmentapl/interface-development/controls/list/grid/results/column/ руководстве разработчика}.
     *
     * Для отображения строки итогов необходимо задать значение в опции {@link Controls/grid:View#resultsPosition resultsPosition}.
     * @example
     * <pre class="brush: html; highlight: [5,6,7,8,9,10,11]">
     * <Controls.grid:View>
     *     <ws:columns>
     *         <ws:Array>
     *             <ws:Object displayProperty="Name">
     *                 <ws:resultsTemplate>
     *                     <ws:partial template="Controls/grid:ResultColumnTemplate">
     *                         <div title="{{resultsTemplate.results.get('Name')}}">
     *                             {{resultsTemplate.results.get('Name')}}
     *                         </div>
     *                     </ws:partial>
     *                 </ws:resultsTemplate>
     *             </ws:Object>
     *         </ws:Array>
     *     </ws:columns>
     * </Controls.grid:View>
     * </pre>
     * @see template
     */
    resultTemplate?: TemplateFunction;
    /**
     * @name Controls/_grid/interface/IColumn#align
     * @cfg {TCellAlign} Горизонтальное выравнивание для содержимого ячейки.
     * @default left
     * @demo Controls-demo/grid/Columns/Align/Index В демо-примере для каждой колонки задано собственное выравнивание содержимого ячеек.
     * @see valign
     */
    align?: TCellAlign;
    /**
     * @name Controls/_grid/interface/IColumn#valign
     * @cfg {TCellVerticalAlign} Вертикальное выравнивание для содержимого ячейки.
     * @default baseline
     * @demo Controls-demo/grid/Columns/Valign/Index В демо-примере для каждой колонки задано собственное выравнивание содержимого ячеек.
     * @remark
     * См. {@link https://developer.mozilla.org/ru/docs/Web/CSS/align-items align-items}.
     * @see align
     */
    valign?: TCellVerticalAlign;
    /**
     * @name Controls/_grid/interface/IColumn#stickyProperty
     * @cfg {String | Array} Имя поля, которое используется для настройки прилипания данных колонки к верхней границе таблицы. Чтобы сделать прилипание по двум полям в одной колонке, нужно передать массив из двух строк.
     * Прилипание работает только для первой колонки таблицы.
     * @remark Подробнее о настройке колонок с прилипанием читайте в <a href="/doc/platform/developmentapl/interface-development/controls/list/grid/ladder/sticky/">руководстве разработчика</a>.
     * @default undefined
     * @demo Controls-demo/grid/LadderStickyMultiline/StickyMultilineWithHeader/Index В демо-примере лесенка и прилипание данных работает для колонок "photo" и "time".
     * @demo Controls-demo/grid/Ladder/Sticky/Index В демо-примере отображение лесенкой включено для колонок "photo" (первая колонка) и "date" (последняя колонка). Прилипание данных работает для колонки photo.
     * @see Controls/grid:IGridControl#ladderProperties
     */
    stickyProperty?: string | string[];
    /**
     * @name Controls/_grid/interface/IColumn#textOverflow
     * @cfg {TOverflow} Как отображается текст, если он не умещается в ячейке.
     * @default none
     * @demo Controls-demo/grid/Columns/TextOverflow/Ellipsis/Index В демо-примере для первой колонки свойство textOverflow установлено в значение ellipsis.
     */
    textOverflow?: TOverflow;
    /**
     * @name Controls/_grid/interface/IColumn#columnSeparatorSize
     * @cfg {TColumnSeparatorSizeConfig} Ширина вертикальных разделителей колонок.
     * @default none
     * @remark
     * Ширину линии-разделителя между двумя колонками можно задать на любой из них (левую или правую соответственно).
     * В случае, если одна и та же граница была определена на двух ячейках, приоритет отдается ячейке, для которой эта граница является левой.
     * Опция {@link Controls/grid:IColumn#columnSeparatorSize columnSeparatorSize} на колонке является приоритетной по сравнению с опцией {@link Controls/grid:View#columnSeparatorSize columnSeparatorSize} на таблице.
     * @example
     * Разделитель только между первой и второй колонками.
     * <pre class="brush: html; highlight: [5,10]">
     * <Controls.grid:View
     *     keyProperty="id"
     *     source="{{_viewSource}}"
     *     columns="{{_columns}}"
     *     columnSeparatorSize="s">
     *     <ws:columns>
     *         <ws:Array>
     *             <ws:Object .../>
     *             <ws:Object .../>
     *             <ws:Object ... columnSeparatorSize="{{ {left: null, right: null} }}" />
     *             <ws:Object .../>
     *         </ws:Array>
     *     </ws:columns>
     * </Controls.grid:View>
     * </pre>
     * @demo Controls-demo/grid/ColumnSeparator/WithMultiHeader/Index В демо-примере ширина вертикальных разделителей колонок задана с размером "s".
     * @see Controls/list:IList#rowSeparatorSize
     * @see Controls/grid:IGridControl#columnSeparatorSize
     */
    columnSeparatorSize?: TColumnSeparatorSizeConfig;
    /**
     * @name Controls/_grid/interface/IColumn#cellPadding
     * @cfg {ICellPadding} Конфигурация левого и правого отступа в ячейках колонки, исключая левый отступ первой и правый последней ячейки.
     * @example
     * <pre class="brush: js; highlight: [6,7,8,14,15,16,17]">
     * columns: [
     *     {
     *         displayProperty: 'number',
     *         width: '100px',
     *         template: itemCountr,
     *         cellPadding: {
     *             right: 's'
     *         }
     *     },
     *     {
     *         displayProperty: 'country',
     *         width: '100px',
     *         template: itemTpl,
     *         cellPadding: {
     *             left: 's',
     *             right: 'null'
     *         }
     *     },
     *     {
     *         displayProperty: 'capital',
     *         width: '100px'
     *     }
     * ]
     * </pre>
     * @demo Controls-demo/grid/CellPadding/Index В демо-примере в конфигурации колонок заданы различные отступы для ячеек колонок.
     * @see template
     */
    cellPadding?: ICellPadding;
    /**
     * @name Controls/_grid/interface/IColumn#tagStyleProperty
     * @cfg {String} Имя свойства, содержащего стиль тега.
     */
    /*
     * @name Controls/_grid/interface/IColumn#tagStyleProperty
     * @cfg {String} Name of the property that contains tag style
     */
    tagStyleProperty?: string;
}
