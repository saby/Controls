/**
 * Интерфейс для поддержки навигации по спискам.
 *
 * @interface Controls/_interface/INavigation
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Interface for list navigation.
 *
 * @interface Controls/_interface/INavigation
 * @public
 * @author Крайнов Д.О.
 */

/**
 * @typedef {String} NavigationSource
 * @description Алгоритм, с которым работает источник данных.
 * @variant position Навигация по курсору. Подробнее читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/cursor/ здесь}.
 * @variant page Постраничная навигация.
 */
/*
 * @typedef {String} NavigationSource
 * @variant position Position-based navigation (cursor).
 * @variant page Page-based navigation.
 */
export type TNavigationSource = 'position' | 'page';

/**
 * @typedef {String} NavigationView
 * @description Режим визуального отображения навигации.
 * @variant infinity Бесконечный скролл.
 * В этом режиме загрузка данных происходит при достижении специального триггера, который расположен в конце скроллируемого контента списка.
 * @variant pages Страницы с постраничной навигацией.
 * В этом режиме загрузка данных происходит при переходе на другую страницу.
 * Навигация осуществляется с помощью кнопок, которые расположены на панели навигации.
 * @variant demand В этом режиме загрузка данных происходит при нажатии кнопки "Ещё", которая расположена под последней загруженной записью.
 * @variant maxCount Подгружать данные пока не будет достигнут порог, который задан в {@link Controls/_interface/INavigation/NavigationViewConfig.typedef maxCountValue}.
 */

/*
 * @typedef {String} NavigationView
 * @variant infinity Infinite scroll.
 * @variant pages Pages with paging control.
 * @variant demand Load next when requested (for example, hasMore button clicked).
 */
export type TNavigationView = 'infinity' | 'pages' | 'demand' | 'maxCount';

/**
 * @typedef {String} Direction
 * @description Направление выборки при навигации по курсору.
 * @variant after Вверх.
 * @variant before Вниз.
 * @variant both В обоих направлениях.
 */

/*
 * @typedef {String} Direction
 * @variant after loading data after positional record.
 * @variant before loading data before positional record.
 * @variant both loading data in both directions relative to the positional record.
 */
export type TNavigationDirection = 'before' | 'after' | 'both';

/**
 * @typedef {Object} PositionSourceConfig
 * @description Конфигурация для навигации по курсору.
 * Подробнее о данном типе навигации читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/cursor/ здесь}.
 * @property {String|Array.<String>} field Имя поля или массив с именами полей, для которых в целевой таблице БД создан индекс.
 * При создании индекса ориентируются на следующий критерий: по значению поля (полей) можно однозначно идентифицировать запись.
 * Наличие индекса является обязательным условием, иначе теряется смысл использования навигации по курсору.
 * @property {String|Array.<String>} position Начальная позиция для курсора.
 * Относительно этой позиции будет создаваться выборка при навигации.
 * Позиция определяется по значению поля или по массиву значений полей, имена которых заданы в опции field.
 * @property {Direction} direction Направление выборки.
 * @property {Number} limit Количество записей, которые запрашиваются при выборке.
 */
/*
 * @typedef {Object} PositionSourceConfig
 * @description Source configuration for position-based (cursor) navigation.
 * @property {String|Array} field Field (fields array) used for position-based navigation.
 * @property {String|Array} position Value of field (fields array) used for position-based navigation.
 * @property {String} direction Loading direction.
 * @property {Number} limit Limit of records requested for a single load.
 */

export interface INavigationPositionSourceConfig {
   field: string[] | string;
   position?: unknown[] | unknown;
   direction?: TNavigationDirection;
   limit?: number;
}

/**
 * @typedef {Object} PageSourceConfig
 * @description Конфигурация для постраничной навигации.
 * @property {Number} page Загружать номер страницы.
 * @property {Number} pageSize Загружать размер страницы.
 * @property {Boolean} hasMore Если поле hasMore имеет значение false, аналогичный параметр добавляется в запрос. В ответ, вместо получения флага наличия записей (логическое значение), ожидается общее количество записей (числовое значение).
 */

/*
 * @typedef {Object} PageSourceConfig
 * @description Source configuration for page-based navigation.
 * @property {Number} page Loading page number.
 * @property {Number} pageSize Loading page size.
 * @property {Boolean} hasMore If hasMore field has false value, similar parameter is added to request. In response instead of receiving a flag for the presence of records (boolean value), the total count of records is expected (number value).
 */
export interface INavigationPageSourceConfig {
    page?: number;
    pageSize: number;
    hasMore?: boolean;
}

/**
 * @typedef {String} TotalInfo
 * @description Режим отображения информационной подписи.
 * @variant basic Отображается только общее число записей.
 * @variant extended Отображается общее число записей, номера первой и последней записей на текущей странице, а также размер страницы.
 */
export type TNavigationTotalIngo = 'basic' | 'extended';

/**
 * @typedef {Object} NavigationViewConfig
 * @property {String} [pagingMode=direct] Режим отображения постраничной навигации.
 * В настоящий момент поддерживается навигация только в прямом направлении: от первой страницы до последней.
 * @property {TotalInfo} [totalInfo=basic] Режим отображения информационной подписи.
 * @property {Number} maxCountValue Количество записей, когда необходимо прекратить загрузку в режиме навигации maxCount.
 * О режиме навигации maxCount вы можете посмотреть {@link Controls/_interface/INavigation/Navigation.typedef здесь}.
 */
export interface INavigationViewConfig {
    pagingMode?: string;
    totalInfo?: TNavigationTotalIngo;
}

/**
 * @typedef {Object} Navigation
 * @description Конфигурация навигации в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/ списочном контроле}.
 * Подробнее о настройке навигации читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/navigation/ здесь}.
 * Подробнее о настройке навигации по курсору читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/cursor/ здесь}.
 * Подробнее об источниках данных читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/data-sources/ здесь}.
 * @property {NavigationSource} source Алгоритм, с которым работает источник данных.
 * @property {NavigationView} view Режим визуального отображения навигации.
 * @property {PositionSourceConfig|PageSourceConfig} sourceConfig Конфигурация алгоритма (см. свойство source), с которым работает источник данных.
 * @property {NavigationViewConfig} viewConfig Конфигурация визуального отображения навигации.
 */

/*
 * @typedef {Object} Navigation
 * @property {NavigationSource} source Algorithm with which the data source works.
 * @property {NavigationView} view Visual interface for navigation (paging buttons, etc.).
 * @property {PositionSourceConfig|PageSourceConfig} sourceConfig Configuration for data source.
 * @property {NavigationViewConfig} viewConfig Configuration for navigation view.
 */
export interface INavigationOptionValue {
   source?: TNavigationSource;
   view?: TNavigationView;
   sourceConfig?: INavigationPageSourceConfig | INavigationPositionSourceConfig;
   viewConfig?: INavigationViewConfig;
}

export interface INavigationOptions {
   navigation?: INavigationOptionValue;
}

/**
 * @name Controls/_interface/INavigation#navigation
 * @cfg {Navigation} Конфигурация навигации по списку. Настройка навигации источника данных (страниц, смещения, положения) и визуального отображения навигации (страниц, бесконечного скролла и т.д.).
 * @remark
 * Подробнее о конфигурации навигации по списку читайте в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/navigation/ руководстве разработчика}.
 * @example
 * В этом примере в списке будут отображаться 2 элемента.
 * <pre>
 * <!-- WML -->
 * <Controls.list:View
 *    keyProperty="id"
 *    source="{{_source}}"
 *    navigation="{{_navigation}}" />
 * </pre>
 * <pre>
 * // JavaScript
 * _beforeMount: function(options) {
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
 *    this._navigation = {
 *       source: 'page',
 *       view: 'pages',
 *       sourceConfig: {
 *          pageSize: 2,
 *          page: 0
 *       }
 *    };
 * }
 * </pre>
 */

/*
 * @name Controls/_interface/INavigation#navigation
 * @cfg {Navigation} List navigation configuration. Configures data source navigation (pages, offset, position) and navigation view (pages, infinite scroll, etc.)
 * @example
 * In this example, 2 items will be displayed in the list.
 * <pre>
 *    <Controls.list:View
 *       keyProperty="id"
 *       source="{{_source}}"
 *       navigation="{{_navigation}}"/>
 * </pre>
 * <pre>
 * _beforeMount: function(options) {
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
 *    this._navigation = {
 *       source: 'page',
 *       view: 'pages',
 *       sourceConfig: {
 *          pageSize: 2,
 *          page: 0
 *       }
 *    };
 * }
 * </pre>
 */
export default interface INavigation {
    readonly '[Controls/_interface/INavigation]': boolean;
}
