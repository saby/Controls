type TSortingValue = 'ASC'|'DESC';
type TSorting = Record<string, TSortingValue>;
export type TSortingOptionValue = TSorting[];

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
 * @cfg {Array.<Object>} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/sorting/ сортировки}.
 * @remark
 * Допустимы значения направления сортировки ASC/DESC.
 * 
 * Если в {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/ конфигурации ячейки шапки} задать свойство {@link Controls/grid:IHeaderCell#sortingProperty sortingProperty}, то в шапке таблицы в конкретной ячейке будет отображаться кнопка для изменения сортировки. Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/sorting/ здесь}.
 * 
 * Выбранную сортировку можно сохранять. Для этого используют опцию {@link Controls/grid:IPropStorage#propStorageId propStorageId}.
 * @example
 * <pre class="brush: js; highlight: [2,4]">
 * // TypeScript
 * protected _sorting: unknown = [],
 * protected _beforeMount(): void {
 *    this._sorting: [{ price: 'DESC' }];
 *    this._columns = [{displayProperty: 'name'}, { displayProperty: 'price'}, {displayProperty: 'balance'}]
 * }
 * </pre>
 * 
 * И связать опцию sorting со свойством контрола.
 * 
 * <pre class="brush: html; highlight: [5]">
 * <!-- WML -->
 * <Controls.grid:View
 *    source="{{_viewSource}}"
 *    columns="{{_columns}}"
 *    bind:sorting="_sorting" />
 * </pre>
 * @see Controls/grid:SortingSelector
 */
