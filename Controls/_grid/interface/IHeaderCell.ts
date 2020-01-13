import {IControlOptions, TemplateFunction} from 'UI/base';
import {ICellPadding, TCellAlign, TCellVerticalAlign} from 'Controls/grid';

/**
 * @typedef {String} THeader
 * @description Тип опции header в таблице
 * @public
 * @author Авраменко А.С.
 */
export type THeader = IHeaderCell[];

/**
 * Интерфейс для конфигурации ячеек шапки в контроле {@link Controls/grid:View Таблица}.
 *
 * @interface Controls/_grid/interface/IHeaderCell
 * @public
 * @author Авраменко А.С.
 */
export interface IHeaderCell extends IControlOptions {
    /**
     * @description Текст заголовка ячейки.
     */
    caption?: string;
    /**
     * @description Выравнивание содержимого ячейки по горизонтали.
     * Доступные значения:
     * @variant left по левому краю.
     * @variant center по центру.
     * @variant right по правому краю.
     * @default left
     */
    align?: TCellAlign;
    /**
     * @description Выравнивание содержимого ячейки по вертикали.
     * Доступные значения:
     * @variant top по верхнему краю.
     * @variant center по центру.
     * @variant bottom по нижнему краю.
     */
    valign?: TCellVerticalAlign;
    /**
     * @description [template=Controls/grid:HeaderContent] Шаблон заголовка ячейки.
     * <br/>Подробнее о работе с шаблоном читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/templates/header/ документации}.
     */
    template?: TemplateFunction;
    /**
     * @description Свойство, по которому выполняется сортировка.
     * <br/>В качестве значения принимает имя поля.
     * <br/>Если в конфигурации ячейки задать это свойство, то в шапке таблицы в конкретной ячейки будет отображаться кнопка для изменения сортировки.
     * <br/>Клик по кнопке будет менять порядок сортировки элементов на противоположный.
     * <br/>При этом элементы будут отсортированы по полю, имя которого указано в свойстве sortingProperty.
     * <pre class="brush: js">
     * _sorting: null,
     * _header: null,
     * _beforeMount: function(){
     *    this._sorting = [
     *       {
     *          price: 'desc'
     *       },
     *       {
     *          balance: 'asc'
     *       }
     *    ],
     *    this._header = [
     *       {
     *          title: 'Цена',
     *          sortingProperty: 'price'
     *       },
     *       {
     *          title: 'Остаток',
     *          sortingProperty: 'balance'
     *       }
     *    ];
     * }
     * </pre>
     */
    sortingProperty?: string;
    /**
     * @description Порядковый номер строки, на которой начинается ячейка.
     */
    startRow?: number;
    /**
     * @description Порядковый номер строки, на которой заканчивается ячейка.
     */
    endRow?: number;
    /**
     * @description Порядковый номер колонки, на которой начинается ячейка.
     */
    startColumn?: number;
    /**
     * @description Порядковый номер колонки, на которой заканчивается ячейка.
     */
    endColumn?: number;
    /**
     * @description Опции, передаваемые в шаблон ячейки заголовка.
     */
    templateOptions?: object;
}
