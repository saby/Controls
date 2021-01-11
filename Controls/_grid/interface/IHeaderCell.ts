import {IControlOptions, TemplateFunction} from 'UI/base';
import {IColspanParams, TCellAlign, TCellVerticalAlign} from 'Controls/grid';

export interface IRowspanParams {
    startRow?: number;
    endRow?: number;
    rowspan?: number;
}

/**
 * @typedef {String} THeader
 * @description Тип опции header в таблице
 * @public
 * @author Авраменко А.С.
 */
export type THeader = IHeaderCell[];

/**
 * Интерфейс для конфигурации ячеек заголовка в контроле {@link Controls/grid:View Таблица}.
 *
 * @interface Controls/_grid/interface/IHeaderCell
 * @public
 * @author Авраменко А.С.
 */
export interface IHeaderCell extends IControlOptions, IRowspanParams, IColspanParams {
    /**
     * @description Текст заголовка ячейки.
     */
    caption?: string;
    /**
     * @typedef {String} TOverflow
     * @description Поведение текста, если он не умещается в ячейке
     * @variant ellipsis Текст обрезается многоточием.
     * @variant none Текст разбивается на несколько строк.
     */
    /**
     * @name Controls/_grid/interface/IHeaderCell#textOverflow
     * @cfg {TOverflow} Поведение текста, если он не умещается в ячейке
     * @default none
     */
    textOverflow?: 'none' | 'ellipsis'
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
     * Подробнее о работе с шаблоном читайте в {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/ документации}.
     * @example
     * **Пример 1.** Шаблон и контрол сконфигурированы в одном WML-файле.
     * <pre class="brush: html">
     * <Controls.grid:View>
     *    <ws:header>
     *       <ws:Array>
     *          <ws:Object title="City">
     *             <ws:template>
     *                <ws:partial template="Controls/grid:HeaderContent">
     *                   <ws:contentTemplate>
     *                      {{contentTemplate.colData.column.title}}
     *                   </ws:contentTemplate>
     *                </ws:partial>
     *             </ws:template>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:header>
     * </Controls.grid:View>
     * </pre>
     *
     * **Пример 2.** Контрол и шаблоны сконфигурированы в отдельных WML-файлах.
     * <pre class="brush: html">
     * <!-- file1.wml -->
     * <Controls.grid:View>
     *    <ws:header>
     *       <ws:Array>
     *          <ws:Object title="City">
     *             <ws:template>
     *                <ws:partial template="wml!file2" scope="{{template}}"/>
     *             </ws:template>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:header>
     * </Controls.grid:View>
     * </pre>
     *
     * <pre class="brush: html">
     * <!-- file2.wml -->
     * <ws:partial template="Controls/grid:HeaderContent">
     *    <ws:contentTemplate>
     *       {{contentTemplate.colData.column.title}}
     *    </ws:contentTemplate>
     * </ws:partial>
     * </pre>
     *
     * **Пример 3.** Шаблон contentTemplate сконфигурирован в отдельном WML-файле.
     *
     * <pre class="brush: html">
     * <!-- file1.wml -->
     * <Controls.grid:View>
     *    <ws:header>
     *       <ws:Array>
     *          <ws:Object title="City">
     *             <ws:template>
     *                <ws:partial template="Controls/grid:HeaderContent">
     *                   <ws:contentTemplate>
     *                      <ws:partial template="wml!file2" scope="{{contentTemplate}}"/>
     *                   </ws:contentTemplate>
     *                </ws:partial>
     *             </ws:template>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:header>
     * </Controls.grid:View>
     * </pre>
     *
     * <pre class="brush: html">
     * <!-- file2.wml -->
     * {{contentTemplate.colData.column.title}}
     * </pre>
     *
     * **Пример 4.** Конфигурация колонки для выравнивания контента по копейкам. На шаблон добавлен CSS-класс "controls-Grid&#95;&#95;cell&#95;spacing&#95;money".
     *
     * <pre class="brush: html; highlight: [6]">
     * <Controls.grid:View>
     *    <ws:header>
     *       <ws:Array>
     *          <ws:Object>
     *             <ws:template>
     *                <ws:partial template="Controls/grid:HeaderContent" attr:class="controls-Grid__cell_spacing_money">
     *                   ...
     *                </ws:partial>
     *             </ws:template>
     *          </ws:Object>
     *       </ws:Array>
     *    </ws:header>
     * </Controls.grid:View>
     * </pre>
     */
    template?: TemplateFunction|string;
    /**
     * @name Controls/_grid/interface/IHeaderCell#sortingProperty
     * @cfg {String} Свойство, по которому выполняется сортировка.
     * @remark
     * В качестве значения принимает имя поля.
     * Одновременно можно сортировать только по одному полю.
     * Если в конфигурации ячейки задать это свойство, то в заголовке таблицы в конкретной ячейке будет отображаться кнопка для изменения сортировки.
     * Клик по кнопке будет менять порядок сортировки элементов на противоположный.
     * При этом элементы будут отсортированы по полю, имя которого указано в свойстве sortingProperty.
     * @example
     * <pre class="brush: js">
     * _sorting: null,
     * _header: null,
     * _beforeMount: function(){
     *    this._sorting = [
     *       {
     *          price: 'DESC'
     *       },
     *       {
     *          balance: 'ASC'
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
    /**
     * @description Поле, для определения ячейки действий
     */
    isActionCell?: boolean;
}
