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
 * @description Обрезается или не обрезается строка
 * @variant ellipsis По верхнему краю.
 * @variant none Текст разбивается на несколько строк.
 */
export type TOverflow = 'ellipsis' | 'none';

/**
 * Интерфейс для конфигурации колонки в контроле {@link Controls/grid:View Таблица}.
 *
 * @interface Controls/grid:IColumn
 * @public
 * @author Авраменко А.С.
 */
export interface IColumn {
    /**
     * @name Controls/grid:IColumn#width
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
     * @name Controls/grid:IColumn#displayProperty
     * @cfg {String} Имя поля, данные которого отображаются в колонке.
     * @remark
     * В качестве значения свойства можно указать только пиксели (px) или проценты (%). Если свойство не задано, применяется значение "auto".
     */
    displayProperty?: string;
    /**
     * @name Controls/grid:IColumn#compatibleWidth
     * @cfg {String} Ширина колонки в браузерах, не поддерживающих {@link https://developer.mozilla.org/ru/docs/web/css/css_grid_layout CSS Grid Layout}.
     * @remark
     * В качестве значения свойства можно указать только пиксели (px) или проценты (%). Если свойство не задано, применяется значение "auto".
     * @see width
     */
    compatibleWidth?: string;
    /**
     * @name Controls/grid:IColumn#template
     * @cfg {String|Function} Устанавливает шаблон отображения ячейки.
     * @default Controls/grid:ColumnTemplate
     * @remark
     * Подробнее о параметрах шаблона Controls/grid:ColumnTemplate читайте {@link Controls/grid:ColumnTemplate здесь}.
     * Подробнее о создании пользовательского шаблона читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/templates/column/ здесь}.
     * 
     */
    template?: TemplateFunction;
    /**
     * @name Controls/grid:IColumn#resultTemplate
     * @cfg {String|Function} Шаблон отображения ячейки в строке итогов.
     * @remark Подробнее о работе со строкой итогов читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/templates/result/ руководство разработчика}.
     */
    resultTemplate?: TemplateFunction;
    /**
     * @name Controls/grid:IColumn#align
     * @cfg {TCellAlign} Выравнивание содержимого ячейки по горизонтали.
     * @default left
     */
    align?: TCellAlign;
    /**
     * @name Controls/grid:IColumn#valign
     * @cfg {TCellVerticalAlign} Выравнивание содержимого ячейки по вертикали.
     * @default baseline
     * @remark
     * См. {@link https://developer.mozilla.org/ru/docs/Web/CSS/align-items align-items}.
     */
    valign?: TCellVerticalAlign;
    /**
     * @name Controls/grid:IColumn#textOverflow
     * @cfg {String} Имя поля, которое используется для настройки прилипания данных колонки к верхней границе таблицы.
     * @default auto
     * @remark
     * В качестве значения свойства можно указать только пиксели (px) или проценты (%).
     * Если свойство не задано, применяется значение "auto".
     */
    stickyProperty?: string;
    /**
     * @name Controls/grid:IColumn#textOverflow
     * @cfg {TOverflow} Определяет параметры видимости текста в блоке, если текст целиком не помещается в заданную область.
     * @default none
     */
    textOverflow?: TOverflow;
    /**
     * @name Controls/grid:IColumn#CellPadding
     * @cfg {ICellPadding} Опции для задания ячейкам левого и правого отступа, исключая левый отступ первой ячейки и правый последней. 
     * @example
     * <pre class="brush: js">
     * columns: [{
     *    width: '1fr',
     *    cellPadding: {
     *        left: 'M',
     *        right: 'M'
     *    }
     * },
     * {
     *    width: '1fr',
     *    cellPadding: {
     *        left: 'S',
     *        right: 'S'
     *    }
     * }]
     * </pre>
     */
    cellPadding?: ICellPadding;
}
