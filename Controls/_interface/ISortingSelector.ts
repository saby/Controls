
/**
 * Контрол в виде кнопки с выпадающим меню, используемый для изменения сортировки. Рекомендуется, если в реестре нет заголовков.
 *
 * @class Controls/grid:SortingSelector
 * @extends Core/Control
 * @mixes Controls/_interface/ISource
 * @public
 */

/**
 * @typedef {Object} SortingParam Объект, содержащий данные о поле для сортировки и название, для отображения в выпадающем списке.
 * @property {String|null} paramName Поле для сортировки. Чтобы задать сброс сортировки, нужно указать значение null
 * @property {String} title Название, для отображения параметра в выпадающем списке
 * @example
 * В опцию передается массив вида
 * <pre class="brush: js;">
 * [{
 *     paramName: 'FirstParam',
 *     title: 'По первому параметру'
 * },
 * {
 *     paramName: 'SecondParam',
 *     title: 'По второму параметру'
 * }]
 * </pre>
 * где paramName - это название поля элемента данных, по которому может осуществляться сортировка,
 * а title - подпись пункта меню, соответствующего данному полю.
 *
 * Чтобы дать возможность сброса сортировки, нужно добваить пункт, со значением paramName = null
 * <pre class="brush: js;">
 * [{
 *     paramName: null,
 *     title: 'По умолчанию'
 * },
 * {
 *     paramName: 'FirstParam',
 *     title: 'По первому параметру'
 * }]
 * </pre>
 * @remark Если не задан пункт, сбрасывающий сортировку, то необходимо указать непустую конфигурацию сортировки в опции value.
 */

/**
 * @name Controls/grid:SortingSelector#value
 * @cfg {Array<Object>} Конфигурация сортировки.
 * @remark Если нет возможности сброса сортировки, то опция value должна содерать данные для сортировки.
 * @example
 * <pre class="brush: js;">
 *  this._sortingSource = new source.Memory({
 *      keyProperty: 'key',
 *      data: [
 *         {
 *            key: '1',
 *            title: 'По цене',
 *            sortingParam: 'price'
 *         },
 *         {
 *            key: '2',
 *            title: 'По количеству',
 *            sortingParam: 'count'
 *         },
 *      ]
 *   });
 * this._sortingValue = [
 *       {
 *          price: 'DESC'
 *       }
 *   ];
 * </pre>
 * Следует использовать bind на опцию value.
 * <pre class="brush: html;">
 * <Controls.grid:SortingSelector
 *   bind:value="_sortingValue"
 *   source="{{_sortingSource}}"
 *   sortingParamProperty="sortingParam'
 *   displayProperty="title"
 * />
 * </pre>
 */

/**
 * @name Controls/grid:SortingSelector#header
 * @cfg {String} Заголовок для меню сортировки.
 * @remark Если заголовок не требуется, можно не указывать.
 */

import {IControlOptions} from 'UI/Base';

export interface ISortingParam {
   paramName: string | null;
   title: string;
}
export interface ISortingSelectorOptions extends IControlOptions {
   sortingParams: [ISortingParam];
   value: [object];
   header: string;
}
