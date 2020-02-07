import {IControlOptions, TemplateFunction} from 'UI/base';
import {TCellAlign, TCellVerticalAlign} from 'Controls/grid';

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
     * @typedef {String} TCellAlign
     * @variant left По левому краю.
     * @variant center По центру.
     * @variant right По правому краю.
     */
    /**
     * @name Controls/_grid/interface/IHeaderCell#align
     * @cfg {TCellAlign} Выравнивание содержимого ячейки по горизонтали.
     * @default left
     */
    align?: TCellAlign;
    /**
     * @typedef {String} TCellVerticalAlign
     * @variant top По верхнему краю.
     * @variant center По центру.
     * @variant bottom По нижнему краю.
     */
    /**
     * @name Controls/_grid/interface/IHeaderCell#valign
     * @cfg {TCellVerticalAlign} Выравнивание содержимого ячейки по вертикали.
     */
    valign?: TCellVerticalAlign;
    /**
     * @name Controls/_grid/interface/IHeaderCell#template
     * @cfg {String|Function} Шаблон заголовка ячейки.
     * @default Controls/grid:HeaderContent
     * @remark
     * Параметры шаблона Controls/grid:HeaderContent доступны {@link Controls/grid:HeaderContent здесь}.
     * Подробнее о работе с шаблоном читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/templates/header/ документации}.
     */
    template?: TemplateFunction;
    /**
     * @name Controls/_grid/interface/IHeaderCell#sortingProperty
     * @cfg {String} Свойство, по которому выполняется сортировка.
     * @remark
     * В качестве значения принимает имя поля.
     * Если в конфигурации ячейки задать это свойство, то в шапке таблицы в конкретной ячейки будет отображаться кнопка для изменения сортировки.
     * Клик по кнопке будет менять порядок сортировки элементов на противоположный.
     * При этом элементы будут отсортированы по полю, имя которого указано в свойстве sortingProperty.
     * @example
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
