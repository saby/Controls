/**
 * Интерфейс быстрого фильтра.
 * @interface Controls/_filter/interface/IFastFilter
 * @public
 * @author Герасимов А.М.
 */

/*
 * Interface for component Fast Filter
 * @interface Controls/_filter/interface/IFastFilter
 * @public
 * @author Герасимов А.М.
 */

export default interface IFastFilter {
    readonly '[Controls/_filter/interface/IFastFilter]': boolean;
}

/**
 * @typedef {Object} PropertiesFastFilter
 * @property {String} keyProperty Имя свойства, уникально идентифицирующего элемент коллекции.
 * @property {String} displayProperty Имя свойства элемента, содержимое которого будет отображаться. Влияет только на значение при выборе.
 * @property {Types/source:Base} source Объект, который реализует интерфейс ICrud для доступа к данным. Если свойство "items" указано, свойство "source" будет игнорироваться.
 * @property {Boolean} multiSelect Определяет, установлен ли множественный выбор.
 * @property {Controls/interface/ISelectorDialog} selectorTemplate Шаблон панели выбора элементов.
 * @property {Function} itemTemplate Шаблон рендеринга элементов. Подробнее - {@link Controls/_menu/interface/IMenuBase#itemTemplate}
 * @property {String} itemTemplateProperty Имя свойства, содержащего шаблон для рендеринга элементов. Подробнее - {@link Controls/_menu/interface/IMenuBase#itemTemplateProperty}
 * @property {Object} filter Конфигурация фильтра-объект с именами полей и их значениями. {@link Controls/_interface/IFilter}
 * @property {Object} navigation Конфигурация навигации по списку. Настройка навигации источника данных (страницы, смещение, положение) и представления навигации (страницы, бесконечная прокрутка и т. д.) {@link Controls/_interface/INavigation}
 * @property {Types/collection:IList} items Специальная структура для визуального представления фильтра. {@link Types/collection:IList}.
 */

/*
 * @typedef {Object} PropertiesFastFilter
 * @property {String} keyProperty Name of the item property that uniquely identifies collection item.
 * @property {String} displayProperty Name of the item property that content will be displayed. Only affects the value when selecting.
 * @property {Types/source:Base} source Object that implements ICrud interface for data access. If 'items' is specified, 'source' will be ignored.
 * @property {Boolean} multiSelect Determines whether multiple selection is set.
 * @property {Controls/interface/ISelectorDialog} selectorTemplate Items selection panel template.
 * @property {Function} itemTemplate Template for item render. For more information, see {@link Controls/_menu/interface/IMenuBase#itemTemplate}
 * @property {String} itemTemplateProperty Name of the item property that contains template for item render. For more information, see {@link Controls/_menu/interface/IMenuBase#itemTemplateProperty}
 * @property {Object} filter Filter configuration - object with field names and their values. {@link Controls/_interface/IFilter}
 * @property {Object} navigation List navigation configuration. Configures data source navigation (pages, offset, position) and navigation view (pages, infinite scroll, etc.) {@link Controls/_interface/INavigation}
 * @property {Types/collection:IList} items Special structure for the visual representation of the filter. {@link Types/collection:IList}.
 */

/**
 * @typedef {Types/source:Base} FastFilterSource
 * @property {String} id Имя поля фильтра.
 * @property {*} value Текущее значение поля фильтра.
 * @property {*} resetValue Значение поля при сбрасывании фильтра.
 * @property {*} textValue Текстовое значение поля фильтра. Используется для отображения текста у кнопки фильтра.
 * @property {PropertiesFastFilter} properties Настройки быстрого фильтра.
 */

/*
 * @typedef {Types/source:Base} FastFilterSource
 * @property {String} id Name of filter field.
 * @property {*} value Current filter field value.
 * @property {*} resetValue Value for reset.
 * @property {*} textValue Text value of filter field. Used to display a textual representation of the filter.
 * @property {PropertiesFastFilter} properties Fast filter settings.
 */

/**
 * @name Controls/_filter/interface/IFastFilter#source
 * @cfg {FastFilterSource} Устанавливает источник набора данных для использования при сопоставлении.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.filter:Fast
 *              bind:selectedKey='_selectedKey'
 *              source="{{_source}}"
 *    />
 * </pre>
 * JS:
 * <pre>
 *    this._source = new MemorySource({
 *       keyProperty: 'id',
 *       data: [
 *          {id: 'genre',
 *           resetValue: '0',
 *           value: '0',
 *           properties: {
 *              keyProperty: 'key',
 *              displayProperty: 'title',
 *              source: new MemorySource({
 *                 keyProperty: 'id',
 *                 data: [
 *                    { key: '0', title: 'все жанры' },
 *                    { key: '1', title: 'фантастика' },
 *                    { key: '2', title: 'фэнтези' },
 *                    { key: '3', title: 'мистика' }
 *                ]
 *              })
 *           }, ...
 *       ]
 *    });
 * </pre>
 */

/*
 * @name Controls/_filter/interface/IFastFilter#source
 * @cfg {FastFilterSource} Sets the source of data set to use in the mapping.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.filter:Fast
 *              bind:selectedKey='_selectedKey'
 *              source="{{_source}}"
 *    />
 * </pre>
 * JS:
 * <pre>
 *    this._source = new MemorySource({
 *       keyProperty: 'id',
 *       data: [
 *          {id: 'genre',
 *           resetValue: '0',
 *           value: '0',
 *           properties: {
 *              keyProperty: 'key',
 *              displayProperty: 'title',
 *              source: new MemorySource({
 *                 keyProperty: 'id',
 *                 data: [
 *                    { key: '0', title: 'все жанры' },
 *                    { key: '1', title: 'фантастика' },
 *                    { key: '2', title: 'фэнтези' },
 *                    { key: '3', title: 'мистика' }
 *                ]
 *              })
 *           }, ...
 *       ]
 *    });
 * </pre>
 */

/**
 * @event Происходит при изменении фильтра.
 * @name Controls/_filter/interface/IFastFilter#filterChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Object} filter Новый фильтр.
 */

/*
 * @event Happens when filter changed.
 * @name Controls/_filter/interface/IFastFilter#filterChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Object} filter New filter.
 */
