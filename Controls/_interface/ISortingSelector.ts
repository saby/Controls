
/**
 * Контрол в виде кнопки с выпадающим меню, используемый для изменения сортировки. Рекомендуется, если в реестре нет заголовков.
 * 
 * @class Controls/grid:SortingSelector
 * @extends Core/Control
 * @public
 * @demo Controls-demo/grid/Sorting/SortingSelector/Index
 * @author Авраменко А.С.
 */

import {IControlOptions} from 'UI/Base';

/**
 * @typedef {Object} SortingParam
 * @property {String|null} paramName Имя поля элемента, по которому может осуществляться сортировка. Чтобы задать сброс сортировки, нужно указать значение null.
 * @property {String} title Подпись пункта меню, соответствующего данному полю.
 * @remark Если не задан пункт, сбрасывающий сортировку, то необходимо указать непустую конфигурацию сортировки в опции value.
 */
export interface ISortingParam {
   paramName: string | null;
   title: string;
}
export interface ISortingSelectorOptions extends IControlOptions {
   
   /**
    * @name Controls/grid:SortingSelector#sortingParams
    * @cfg {Array.<SortingParam>} Параметры сортировки.
    * @example
    * В опцию передается массив вида
    * <pre class="brush: js;">
    * _sortingParam: null,
    * _beforeMount: function(options) {
    *    this._sortingParam = [
    *       {
    *          paramName: 'FirstParam',
    *          title: 'По первому параметру'
    *       },
    *       {
    *          paramName: 'SecondParam',
    *          title: 'По второму параметру'
    *       }
    *    ]
    * }
    * </pre>
    *
    * Чтобы дать возможность сброса сортировки, нужно добавить пункт со значением paramName = null.
    * 
    * <pre class="brush: js; highlight: [5]">
    * _sortingParam: null,
    * _beforeMount: function(options) {
    *    this._sortingParam = [
    *       {
    *          paramName: null,
    *          title: 'По умолчанию'
    *       },
    *       {
    *          paramName: 'Name',
    *          title: 'По имени'
    *       }
    *    ]
    * }
    * </pre>
    */
   sortingParams: [ISortingParam];
   /**
    * @name Controls/grid:SortingSelector#value
    * @cfg {Array.<Object>} Конфигурация сортировки.
    * @remark Если нет возможности сброса сортировки, то опция value должна содержать данные для сортировки.
    * @example
    * <pre class="brush: js;">
    * _sortingValue: null,
    * _sortingParam: null,
    * _beforeMount: function(options) {
    *    this._sortingParam = [
    *       {
    *          paramName: 'Name',
    *          title: 'По имени'
    *       },
    *       {
    *          paramName: 'Surname',
    *          title: 'По фамилии'
    *       }
    *    ]
    *    this._sortingValue = [
    *       {
    *          Name: 'DESC'
    *       }
    *    ];
    * }
    * </pre>
    * 
    * Следует использовать директиву bind для опции value.
    * 
    * <pre class="brush: html; highlight: [2,4]">
    * <Controls.grid:SortingSelector
    *   bind:value="_sortingValue" 
    *   sortingParams="{{_sortingParam}}" />
    * </pre>
    */
   value: [object];
   /**
    * @name Controls/grid:SortingSelector#header
    * @cfg {String} Заголовок для меню сортировки.
    * @remark Если заголовок не требуется, можно не указывать.
    */
   header: string;
}