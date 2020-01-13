export interface ISortingOptions {
   sorting?: any;
}

/**
 * Интерфейс для контролов, реализующих сортировку.
 *
 * @interface Controls/_interface/ISorting
 * @public
 * @author Авраменко А.С.
 */
export default interface ISorting {
   readonly '[Controls/_interface/ISorting]': boolean;
}

/**
 * @name Controls/_interface/ISorting#sorting
 * @cfg {Array.<Object>} Определяет сортировку контрола. Допустимы значения ASD/DESC.
 * @example
 * В шапке столбца необходимо задать свойство sortingProperty:
 * <pre class="brush: js; highlight: [19, 23]">
 * _sorting: null
 * _header: null,
 * _columns: null,
 * _beforeMount: function(options) {
 *    this._sorting = [
 *        {
 *           price: 'DESC'
 *        }
 *    ];
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
 * И привязать опцию сортировки или подписаться на событие sortingChanged и изменить сортировку вручную:
 * <pre>
 *  <Controls.grid:View
 *      displayProperty="title"
 *      header="{{_header}}"
 *      columns="{{_columns}}"
 *      bind:sorting="_sorting">
 *  </Controls.grid:View>
 * </pre>
 *
 * Настройка сортировки массива:
 * <pre>
 * [
 *    { price: 'DESC' }
 * ]
 * </pre>
 * Используйте политику сортировки null-значений, разместив их перед "непустыми" значениями или после:
 * <pre>
 * [
 *    ['price', 'DESC', false],
 * ]
 * </pre>
 * Дополнительную информацию смотрите в разделе <a href="/doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/declr/#javascript">декларативный списочный метод</a>.
 * @see Controls/grid:SortingSelector
 */
