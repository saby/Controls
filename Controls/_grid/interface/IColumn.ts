import {TemplateFunction} from 'UI/Base';

/**
 * @typedef {IColumn[]}
 * @description Тип опции columns в таблице
 * @public
 */
export type TColumns = IColumn[];

/**
 * @typedef {String} TCellPaddingVariant
 * @description Возможные значения отсупов внутри ячейки таблицы
 * @variant S Небольшой отступ.
 * @variant M Средний отступ.
 * @variant null Нулевой отступ.
 * @default null
 * @public
 */
export type TCellPaddingVariant = 'S' | 'M' | 'null';

/**
 * @typedef {Object}
 * @description Опции для задания ячейкам левого и правого отступа, исключая левый отступ первой ячейки и правый последней.
 * @property {TCellPaddingVariant} [left=null] Отступ от левой границы ячейки.
 * @property {TCellPaddingVariant} [right=null] Отступ от правой границы ячейки.
 * @interface
 * @public
 */
export interface ICellPadding {
    left?: TCellPaddingVariant;
    right?: TCellPaddingVariant;
}

/**
 * @typedef {String}
 * @description Значения для выравнивания ячеек по горизонтали.
 * @variant left по левому краю.
 * @variant center по центру.
 * @variant right по правому краю.
 * @default left
 * @public
 */
export type TCellAlign = 'left' | 'center' | 'right';

/**
 * @typedef {String}
 * @description Значения для выравнивания ячеек по вертикали.
 * @variant top по верхнему краю.
 * @variant center по центру.
 * @variant bottom по нижнему краю.
 * @variant baseline по базовой линии.
 * @default baseline
 * @public
 */
export type TCellVerticalAlign = 'top' | 'center' | 'bottom' | 'baseline';

/**
 * @typedef {String}
 * @description Обрезается или не обрезается строка
 * @variant ellipsis по верхнему краю.
 * @variant none текст разбивается на несколько строк.
 * @default none
 * @public
 */
export type TOverflow = 'ellipsis' | 'none';

/**
 * Интерфейс для конфигурации колонки в контроле {@link Controls/grid:View Таблица}.
 *
 * @interface Controls/_grid/interface/IColumn
 * @public
 * @author Авраменко А.С.
 */
export interface IColumn {
    /**
     * @description Ширина колонки.
     * <br/>В качестве значения свойства можно указать пиксели (px), проценты (%), доли (1fr), "auto", "minmax", "max-content" и "min-content".
     * <br/>В значении "auto" ширина колонки устанавливается автоматически исходя из типа и содержимого элемента.
     * <br/>В значении "minmax(,)" ширина колонки устанавливается автоматически в рамках заданного интервала. Например, "minmax(600px, 1fr)" означает, что минимальная ширина колонки 600px, а максимальная — 1fr.
     * <br/>В значении "max-content" ширина колонки устанавливается автоматически в зависимости от самой большой ячейки. Например, если в первой строке ширина ячейки 100px, а во второй строке — 200px, тогда ширина колонки будет определена как 200px.
     * <br/>В значении "min-content" для колонки устанавливается наименьшая возможная ширина, при которой не возникает переполнения ячейки. Например, если в первой строке ячейка содержит контент "Первая строка", а во второй — "Содержимое второй строки" и включен перенос по словам, то ширина рассчитается по наиболее широкому непереносимому слову, а это слово "Содержимое" из второй строки.
     * <br/>Для браузеров, которые не поддерживают технологию <a href="https://developer.mozilla.org/ru/docs/web/css/css_grid_layout">CSS Grid Layout</a>, не работает ширина колонки, указанная в долях, "auto" или "minmax". Для таких браузеров используйте свойство compatibleWidth.
     */
    width: string;
    /**
     * @description Имя поля, данные которого отображаются в колонке.
     * <br/>В качестве значения свойства можно указать только пиксели (px) или проценты (%). Если свойство не задано, применяется значение "auto".
     */
    displayProperty?: string;
    /**
     * @description Ширина колонки в браузерах, не поддерживающих "CSS Grid Layout".
     * <br/>В качестве значения свойства можно указать только пиксели (px) или проценты (%). Если свойство не задано, применяется значение "auto".
     */
    compatibleWidth?: string;
    /**
     * @description Шаблон отображения ячейки.
     * <br/>О создании пользовательского шаблона читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/grid/templates/column/">здесь</a>.
     * @default {@link https://wi.sbis.ru/docs/js/Controls/grid/ColumnTemplate/ Controls/grid:ColumnTemplate}
     */
    template?: TemplateFunction;
    /**
     * @description Шаблон отображения ячейки в строке итогов.
     * <br/>Подробнее о работе со строкой итогов читайте в <a href="/doc/platform/developmentapl/interface-development/controls/list/grid/templates/result/">руководство разработчика</a>.
     * @default {@link https://wi.sbis.ru/docs/js/Controls/grid/ResultsTemplate/ Controls/grid:ResultsTemplate}
     */
    resultTemplate?: TemplateFunction;
    /**
     * @description Выравнивание содержимого ячейки по горизонтали.
     */
    align?: TCellAlign;
    /**
     * @description Выравнивание содержимого ячейки по вертикали.
     * <br/>см. {@link https://developer.mozilla.org/ru/docs/Web/CSS/align-items align-items}.
     */
    valign?: TCellVerticalAlign;
    /**
     * @description Имя поля, которое используется для настройки прилипания данных колонки к верхней границе таблицы.
     * <br/>В качестве значения свойства можно указать только пиксели (px) или проценты (%). Если свойство не задано, применяется значение "auto".
     */
    stickyProperty?: string;
    /**
     * @description Определяет параметры видимости текста в блоке, если текст целиком не помещается в заданную область.
     */
    textOverflow?: TOverflow;
    /**
     * @description Опции для задания ячейкам левого и правого отступа, исключая левый отступ первой ячейки и правый последней.
     * <pre>
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
