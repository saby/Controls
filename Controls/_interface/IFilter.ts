import {IHashMap} from 'Types/declarations';

export interface IFilterOptions {
    filter?: IHashMap<unknown>;
}

/**
 * Интерфейс для контролов, которые поддерживают фильтрацию данных.
 *
 * @interface Controls/_interface/IFilter
 * @public
 * @author Авраменко А.С.
 */
export default interface IFilter {
    readonly '[Controls/_interface/IFilter]': boolean;
}

/**
 * @name Controls/_interface/IFilter#filter
 * @cfg {Object} Конфигурация объекта фильтра. Фильтр отправляется в запрос к источнику для получения данных.
 * @remark
 * При изменении фильтра важно передавать новый объект фильтра, изменение объекта по ссылке не приведет к желаемому результату.
 * @example
 * В данном примере в списке будет отображаться 2 элемента.
 * <pre>
 *    <Controls.list:View
 *       keyProperty="id"
 *       filter="{{_filter}}"
 *       source="{{_source}}" />
 * </pre>
 * <pre>
 *    this._filter = {id: ['1', '2']};
 *    this._source = new Memory({
 *      keyProperty: 'id',
 *      data: [
 *         {
 *            id: '1',
 *            title: 'Yaroslavl'
 *         },
 *         {
 *            id: '2',
 *            title: 'Moscow'
 *         },
 *         {
 *            id: '3',
 *            title: 'St-Petersburg'
 *         }
 *      ]
 *    });
 * </pre>
 * @see filterChanged
 */

/*
 * @name Controls/_interface/IFilter#filter
 * @cfg {Object} Filter configuration - object with field names and their values.
 * @remark
 * You must pass a new filter object when you change the filter. You won't get the desired result if you change the object by reference.
 * @example
 * In this example, the list will be displayed 2 items.
 * TMPL:
 * <pre>
 *    <Controls.list:View
 *       keyProperty="id"
 *       filter={{_filter}}
 *       source="{{_source}}" />
 * </pre>
 * JS:
 * <pre>
 *    this._filter = {id: ['1', '2']};
 *    this._source = new Memory({
 *      keyProperty: 'id',
 *      data: [
 *         {
 *            id: '1',
 *            title: 'Yaroslavl'
 *         },
 *         {
 *            id: '2',
 *            title: 'Moscow'
 *         },
 *         {
 *            id: '3',
 *            title: 'St-Petersburg'
 *         }
 *      ]
 *    });
 * </pre>
 */

/**
 * @event Controls/_interface/IFilter#filterChanged Происходит при изменении фильтра.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Object} filter Изменённый фильтр.
 * @remark
 * Важно помнить, что опции {@link https://ru.m.wikipedia.org/wiki/Неизменяемый_объект иммутабельны}, поэтому фильтр в аргументах события отличается от фильтра в опциях контрола.
 * @example
 * <pre>
 * <!-- WML -->
 * <Controls.filter:Controller on:filterChanged="filterChanged()" filter="{{ _filter }}"/>
 * {{ _filterString }}
 * </pre>
 * <pre>
 * // JavaScript
 * _filter: null,
 * _beforeMount: function() {
 *    this._filter = {
 *       city: 'Yaroslavl'
 *    }
 * },
 * filterChanged: function(e, filter) {
 *
 *    // Т.к. в приведённом примере опция filter не связана с помощью bind c состоянием,
 *    // необходимо обновить фильтр на состоянии самостоятельно.
 *    this._filter = filter;
 *    this._filterString = JSON.stringify(this._filter, null, 4);
 * }
 * </pre>
 * @see filter
 */

/*
 * @event Controls/_interface/IFilter#filterChangedENG Occurs when filter were changed.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Object} new filter
 * @noshow
 * @remark
 * It's important to remember that we don't mutate filter from options (or any other option). So filter in the event arguments and filter in the component's options are not the same.
 * @example
 * WML:
 * <pre>
 *    <Controls.filter:Controller on:filterChanged="filterChanged()" filter="{{ _filter }}"/>
 *    <pre>{{ _filterString }}</pre>
 * </pre>
 * JS:
 * <pre>
 *    _filter: null,
 *    _beforeMount: function() {
 *       this._filter = {
 *          city: 'Yaroslavl'
 *       }
 *    },
 *    filterChanged: function(e, filter) {
 *       this._filter = filter; //We don't use binding in this example so we have to update state manually.
 *       this._filterString = JSON.stringify(this._filter, null, 4);
 *    }
 * </pre>
 * @see filter
 */
