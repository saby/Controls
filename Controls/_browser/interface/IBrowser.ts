/**
 * Интерфейс опций для контрола "Браузер".
 * @interface Controls/_browser/interface/IBrowser
 * @author Герасимов А.М.
 * @public
 */

/**
 * @name Controls/_browser/interface/IBrowser#fastFilterSource
 * @cfg {Array|Function|Types/collection:IList} Элемент или функция FastFilter, которая возвращает элемент FastFilter.
 */

/**
 * @name Controls/_browser/interface/IBrowser#filterButtonSource
 * @cfg {Array|Function|Types/collection:IList} Элемент или функция FilterButton, которая возвращает элемент FilterButton.
 */

/**
 * @name Controls/_browser/interface/IBrowser#historyId
 * @cfg {String} Идентификатор, под которым будет сохранена история фильтра.
 */

/**
 * @name Controls/_browser/interface/IBrowser#root
 * @cfg {Number|String} Идентификатор корневого узла. Значение опции root добавляется в фильтре в поле {@link Controls/interface:IHierarchy/#parentProperty parentProperty}.
 */
