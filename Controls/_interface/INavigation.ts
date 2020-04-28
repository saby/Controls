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
 * @typedef {String} TNavigationSource
 * @description Алгоритм, с которым работает источник данных.
 * @variant position Навигация по курсору. Подробнее читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/cursor/ здесь}.
 * @variant page Постраничная навигация.
 */
/*
 * @typedef {String} TNavigationSource
 * @variant position Position-based navigation (cursor).
 * @variant page Page-based navigation.
 */
export type TNavigationSource = 'position' | 'page';

/**
 * @typedef {String} TNavigationView
 * @description Режим визуального отображения навигации.
 * @variant infinity Бесконечный скролл.
 * В этом режиме загрузка данных происходит при достижении специального триггера, который расположен в конце скроллируемого контента списка.
 * @variant pages Страницы с постраничной навигацией.
 * В этом режиме загрузка данных происходит при переходе на другую страницу.
 * Навигация осуществляется с помощью кнопок, которые расположены на панели навигации.
 * @variant demand В этом режиме загрузка данных происходит при нажатии кнопки "Ещё", которая расположена под последней загруженной записью.
 * @variant maxCount Подгружать данные пока не будет достигнут порог, который задан в {@link Controls/_interface/INavigation/INavigationViewConfig.typedef maxCountValue}.
 */

/*
 * @typedef {String} TNavigationView
 * @variant infinity Infinite scroll.
 * @variant pages Pages with paging control.
 * @variant demand Load next when requested (for example, hasMore button clicked).
 * @variant maxCount Load data until threshold value set in {@link Controls/_interface/INavigation/INavigationViewConfig.typedef maxCountValue}.
 */
export type TNavigationView = 'infinity' | 'pages' | 'demand' | 'maxCount';

/**
 * @typedef {String} TNavigationDirection
 * @description Направление выборки при навигации по курсору.
 * @variant forward Вниз.
 * @variant backward Вверх.
 * @variant bothways В обоих направлениях.
 */

/*
 * @typedef {String} TNavigationDirection
 * @variant forward loading data after positional record.
 * @variant backward loading data before positional record.
 * @variant bothways loading data in both directions relative to the positional record.
 */
export type TNavigationDirection = 'backward' | 'forward' | 'bothways';

/**
 * @typedef {Object} IBasePositionSourceConfig
 * @description Конфигурация источника данных для перезагрузки при навигации по курсору.
 * Подробнее о данном типе навигации читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/cursor/ здесь}.
 * @property {String|Array.<String>} position Начальная позиция для курсора.
 * Относительно этой позиции будет создаваться выборка при навигации.
 * Позиция определяется по значению поля или по массиву значений полей, имена которых заданы в опции field.
 * @property {TNavigationDirection} direction Направление выборки. Варианты значений: 'backward' | 'forward' | 'bothways'
 * @property {Number} limit Количество записей, которые запрашиваются при выборке.
 */

export interface IBasePositionSourceConfig {
    position?: unknown[] | unknown;
    direction?: TNavigationDirection;
    limit?: number;
}

/**
 * @typedef {Object} INavigationPositionSourceConfig
 * @description Конфигурация для навигации по курсору.
 * Подробнее о данном типе навигации читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/cursor/ здесь}.
 * @property {String|Array.<String>} field Имя поля или массив с именами полей, для которых в целевой таблице БД создан индекс.
 * При создании индекса ориентируются на следующий критерий: по значению поля (полей) можно однозначно идентифицировать запись.
 * Наличие индекса является обязательным условием, иначе теряется смысл использования навигации по курсору.
 * @property {String|Array.<String>} position Начальная позиция для курсора.
 * Относительно этой позиции будет создаваться выборка при навигации.
 * Позиция определяется по значению поля или по массиву значений полей, имена которых заданы в опции field.
 * @property {TNavigationDirection} direction Направление выборки. Варианты значений: 'backward' | 'forward' | 'bothways'
 * @property {Number} limit Количество записей, которые запрашиваются при выборке.
 */
/*
 * @typedef {Object} INavigationPositionSourceConfig
 * @description Source configuration for position-based (cursor) navigation.
 * @property {String|Array} field Field (fields array) used for position-based navigation.
 * @property {String|Array} position Value of field (fields array) used for position-based navigation.
 * @property {TNavigationDirection} direction Loading direction. Variants: 'backward' | 'forward' | 'bothways'
 * @property {Number} limit Limit of records requested for a single load.
 */

export interface INavigationPositionSourceConfig extends IBasePositionSourceConfig {
    field: string[] | string;
}

/**
 * @typedef {Object} IBasePageSourceConfig
 * @description Конфигурация для постраничной навигации.
 * @property {Number} page Номер загружаемой страницы.
 * @property {Number} pageSize Размер загружаемой страницы.
 */

export interface IBasePageSourceConfig {
    page?: number;
    pageSize: number;
}

/**
 * @typedef {Object} INavigationPageSourceConfig
 * @description Конфигурация источника данных для перезагрузки при постраничной навигации.
 * @property {Number} page Номер загружаемой страницы.
 * @property {Number} pageSize Размер загружаемой страницы.
 * @property {Boolean} hasMore Если поле hasMore имеет значение false, аналогичный параметр добавляется в запрос. В ответ, вместо получения флага наличия записей (логическое значение), ожидается общее количество записей (числовое значение).
 */

/*
 * @typedef {Object} INavigationPageSourceConfig
 * @description Source configuration for page-based navigation.
 * @property {Number} page Loading page number.
 * @property {Number} pageSize Loading page size.
 * @property {Boolean} hasMore If hasMore field has false value, similar parameter is added to request. In response instead of receiving a flag for the presence of records (boolean value), the total count of records is expected (number value).
 */
export interface INavigationPageSourceConfig extends IBasePageSourceConfig{
    hasMore?: boolean;
}

/**
 * @typedef {Object} INavigationSourceConfig
 * @description Конфигурация навигации ({@link Controls/_interface/INavigation/INavigationPositionSourceConfig.typedef по курсору} или {@link Controls/_interface/INavigation/INavigationPageSourceConfig.typedef постраничная}).
 */
/*
 * @typedef {Object} INavigationSourceConfig
 * @description Source configuration for both page-based and position-based (cursor) navigation.
 */
export type INavigationSourceConfig = INavigationPositionSourceConfig | INavigationPageSourceConfig;
export type IBaseSourceConfig = IBasePositionSourceConfig | IBasePageSourceConfig;

/**
 * @typedef {String} TNavigationTotalInfo
 * @description Режим отображения информационной подписи.
 * @variant basic Отображается только общее число записей.
 * @variant extended Отображается общее число записей, номера первой и последней записей на текущей странице, а также размер страницы.
 */
export type TNavigationTotalInfo = 'basic' | 'extended';

/**
 * @typedef {Object} INavigationViewConfig
 * @property {String} [pagingMode=direct] Режим отображения постраничной навигации.
 * В настоящий момент поддерживается навигация только в прямом направлении: от первой страницы до последней.
 * @property {TNavigationTotalInfo} [totalInfo=basic] Режим отображения информационной подписи.
 * @property {Number} maxCountValue Количество записей, когда необходимо прекратить загрузку в режиме навигации maxCount.
 * О режиме навигации maxCount вы можете посмотреть {@link Controls/_interface/INavigation/Navigation.typedef здесь}.
 * @property {Boolean} [showEndButton=false] Видимость кнопки перехода в конец списка.
 * Когда параметр принимает значение true, кнопка отображается.
 */
export interface INavigationViewConfig {
    pagingMode?: string;
    totalInfo?: TNavigationTotalInfo;
    maxCountValue?: number;
    showEndButton?: boolean;
}

/**
 * @typedef {Object} INavigationOptionValue
 * @description Конфигурация навигации в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/ списочном контроле}.
 * Подробнее о настройке навигации читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/navigation/ здесь}.
 * Подробнее о настройке навигации по курсору читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/cursor/ здесь}.
 * Подробнее об источниках данных читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/data-sources/ здесь}.
 * @property {TNavigationSource} source Алгоритм, с которым работает источник данных. Варианты значений: 'position' | 'page'
 * @property {TNavigationView} view Режим визуального отображения навигации. Варианты значений: 'infinity' | 'pages' | 'demand' | 'maxCount'
 * @property {INavigationSourceConfig} sourceConfig Конфигурация алгоритма, с которым работает источник данных. см. ({@link Controls/_interface/INavigation/INavigationSourceConfig.typedef INavigationSourceConfig}
 * @property {INavigationViewConfig} viewConfig Конфигурация визуального отображения навигации. см. ({@link Controls/_interface/INavigation/INavigationViewConfig.typedef INavigationViewConfig}
 */

/*
 * @typedef {Object} INavigationOptionValue
 * @property {TNavigationSource} source Algorithm with which the data source works. Variants: 'position' | 'page'
 * @property {TNavigationView} view Visual interface for navigation (paging buttons, etc.). Variants: 'infinity' | 'pages' | 'demand' | 'maxCount'
 * @property {INavigationSourceConfig} sourceConfig Configuration for data source. See. ({@link Controls/_interface/INavigation/INavigationSourceConfig.typedef INavigationSourceConfig}
 * @property {INavigationViewConfig} viewConfig Configuration for navigation view. See. ({@link Controls/_interface/INavigation/INavigationViewConfig.typedef INavigationViewConfig}
 */
export interface INavigationOptionValue<U> {
    source?: TNavigationSource;
    view?: TNavigationView;
    sourceConfig?: U;
    viewConfig?: INavigationViewConfig;
}

export interface INavigationOptions<U> {
    navigation?: INavigationOptionValue<U>;
}

/**
 * @name Controls/_interface/INavigation#navigation
 * @cfg {INavigationOptionValue} Конфигурация навигации по списку. Настройка навигации источника данных (страниц, смещения, положения) и визуального отображения навигации (страниц, бесконечного скролла и т.д.).
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
 *    this._navigation: INavigationOptionValue<INavigationPageSourceConfig> = {
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
 *    this._navigation: INavigationOptionValue<INavigationPageSourceConfig> = {
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
