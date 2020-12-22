export interface ISortingOptions {
   sorting?: any;
}

/**
 * Интерфейс для контролов, реализующих сортировку.
 * @public
 * @author Авраменко А.С.
 */
export default interface ISorting {
   readonly '[Controls/_interface/ISorting]': boolean;
}

/**
 * @name Controls/_interface/ISorting#sorting
 * @cfg {Array.<Object>} Конфигурация сортировки.
 * @remark
 * Допустимы значения ASC/DESC.
 * 
 * Одновременно можно сортировать только по одному полю.
 * 
 * Если в конфигурации ячейки задать свойство sortingProperty, то в шапке таблицы в конкретной ячейке будет отображаться кнопка для изменения сортировки. Клик по кнопке будет менять порядок сортировки элементов на противоположный. При этом элементы будут отсортированы по полю, имя которого указано в свойстве sortingProperty.
 * 
 * Выбранную сортировку можно сохранять. Для этого используют опцию {@link Controls/grid:IPropStorage#propStorageId propStorageId}.
 * @example
 * В шапке столбца необходимо задать свойство sortingProperty:
 * 
 * <pre class="brush: js; highlight: [15, 19]">
 * // JavaScript
 * _sorting: null
 * _header: null,
 * _columns: null,
 * _beforeMount: function(options) {
 *    this._sorting = [{
 *        price: 'DESC'
 *    }];
 *    this._header = [
 *       {
 *          caption: ''
 *       },
 *       {
 *          caption: 'Цена',
 *          sortingProperty: 'price'
 *       },
 *       {
 *          caption: 'Остаток',
 *          sortingProperty: 'balance'
 *       }
 *    ];
 *    this._columns = [
 *       {
 *          displayProperty: 'name'
 *       },
 *       {
 *          displayProperty: 'price'
 *       },
 *       {
 *          displayProperty: 'balance'
 *       }
 *    ];
 * }
 * </pre>
 * 
 * И связать опцию sorting со свойством контрола.
 * 
 * <pre class="brush: html; highlight: [6]">
 * <!-- WML -->
 * <Controls.grid:View
 *    displayProperty="title"
 *    header="{{_header}}"
 *    columns="{{_columns}}"
 *    bind:sorting="_sorting" />
 * </pre>
 *
 * Настройка сортировки массива:
 * 
 * <pre class="brush: js">
 * // JavaScript
 * [
 *    { price: 'DESC' }
 * ]
 * </pre>
 * 
 * Дополнительную информацию смотрите в разделе {@link /doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/declr/#javascript декларативный списочный метод}.
 * @see Controls/grid:SortingSelector
 */
