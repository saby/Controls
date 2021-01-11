export interface ISearchOptions {
   searchParam: string;
   minSearchLength: number;
   searchDelay: number;
   searchValueTrim: boolean;
}
/**
 * Интерфейс для ввода запроса в поле поиска.
 * @public
 * @author Золотова Э.Е.
 */

/*
 * Interface for Search inputs.
 * @interface Controls/_interface/ISearch
 * @public
 * @author Золотова Э.Е.
 */
export default interface ISearch {
   readonly '[Controls/_interface/ISearch]': boolean;
}

/**
 * @name Controls/_interface/ISearch#searchValueTrim
 * @cfg {Boolean} Определяет, удалять ли пробелы у текста для поиска.
 * @remark
 * Пробелы удаляются только для текста, который отправляется в поисковой запрос,
 * текст в поле ввода при этом будет продолжать содержать пробелы.
 * @default false
 * @example
 * В этом примере в поисковой запрос будет отправлен текст "Ярославль".
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.suggest:Input searchDelay="{{1000}}" searchParam="city" value="  Ярославль   "/>
 * </pre>
 */
/**
 * @name Controls/_interface/ISearch#searchValueTrim
 * @cfg {Boolean} Determines whether search value is trimmed.
 * @default false
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.suggest:Input searchDelay="{{1000}}" searchParam="city" value="  Yaroslavl   "/>
 * </pre>
 */

/**
 * @name Controls/_interface/ISearch#searchDelay
 * @cfg {Number} Задержка между вводом символа и выполнением поискового запроса.
 * @remark
 * После ввода каждого символа задержка будет запущена заново.
 * Нулевая задержка имеет смысл для локальных данных, но может создавать большую нагрузку для удаленных данных.
 * Значение задается в миллисекундах.
 * @default 500
 * @demo Controls-demo/dropdown_new/Search/SearchDelay/Index
 * @example
 * В этом примере поиск начнется после 1 сек задержки.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.suggest:Input searchDelay="{{1000}}" searchParam="city"/>
 * </pre>
 */

/*
 * @name Controls/_interface/ISearch#searchDelay
 * @cfg {Number} The delay between when a symbol was typed and when a search is performed.
 * @remark
 * A zero-delay makes sense for local data (more responsive), but can produce a lot of load for remote data, while being less responsive.
 * Value is set in milliseconds.
 * @demo Controls-demo/dropdown_new/Search/SearchDelay/Index
 * @example
 * In this example search will start after 1s delay.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.suggest:Input searchDelay="{{1000}}" searchParam="city"/>
 * </pre>
 */

/**
 * @name Controls/_interface/ISearch#minSearchLength
 * @cfg {Number} Минимальное количество символов, которое пользователь должен ввести для выполнения поискового запроса.
 * @default 3
 * @demo Controls-demo/dropdown_new/Search/MinSearchLength/Index
 * @remark
 * Ноль подойдет для локальных данных с несколькими элементами, но более высокое значение следует использовать, когда поиск одного символа может соответствовать нескольким тысячам элементов.
 * @example
 * В этом примере поиск начинается после ввода 2 символа.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.suggest:Input minSearchLength="{{2}}" searchParam="city"/>
 * </pre>
 */

/*
 * @name Controls/_interface/ISearch#minSearchLength
 * @cfg {Number} The minimum number of characters a user must type before a search is performed.
 * @remark
 * Zero is useful for local data with just a few items, but a higher value should be used when a single character search could match a few thousand items.
 * @demo Controls-demo/dropdown_new/Search/MinSearchLength/Index
 * @example
 * In this example search starts after typing 2 characters.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.suggest:Input minSearchLength="{{2}}" searchParam="city"/>
 * </pre>
 */

/**
 * @name Controls/_interface/ISearch#searchParam
 * @cfg {String} Имя поля фильтра, в значение которого будет записываться текст для поиска.
 * Фильтр с этим значением будет отправлен в поисковой запрос в источнику данных.
 * @demo Controls-demo/dropdown_new/Search/SearchParam/Index
 * @example
 * В этом примере вы можете найти город, введя название города.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.suggest:Input minSearchLength="{{2}}" searchParam="city"/>
 * </pre>
 */

/*
 * @name Controls/_interface/ISearch#searchParam
 * @cfg {String} Name of the field that search should operate on. Search value will insert in filter by this parameter.
 * @demo Controls-demo/dropdown_new/Search/SearchParam/Index
 * @example
 * In this example you can search city by typing city name.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.suggest:Input minSearchLength="{{2}}" searchParam="city"/>
 * </pre>
 */
