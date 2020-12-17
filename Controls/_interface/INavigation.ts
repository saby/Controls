/**
 * @typedef {String} TNavigationSource
 * @description Режимы работы с источником данных, подробнее о которых можно прочитать <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/">здесь</a>.
 * @variant position Навигация по курсору.
 * @variant page Навигация с фиксированным количеством загружаемых записей.
 */
/*
 * @typedef {String} TNavigationSource
 * @variant position Position-based navigation (cursor).
 * @variant page Page-based navigation.
 */
export type TNavigationSource = 'position' | 'page';

/**
 * @typedef {String} TNavigationView
 * @description Виды <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/">визуального представления навигации</a>.
 * @variant infinity Бесконечная прокрутка.
 * Список отображается в виде "бесконечной ленты" записей.
 * Загрузка данных происходит при прокрутке, когда пользователь достигает конца списка.
 * Можно настроить отображение панели с кнопками навигации и подсчетом общего количества записей.
 * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/infinite-scrolling/">здесь</a>.
 * @variant pages Постраничное отображение данных.
 * Список отображает только одну страницу с записями.
 * Загрузка данных происходит при переходе между страницами.
 * Переход осуществляется с помощью панели с кнопками навигации, рядом с которыми можно настроить отображение количества всех записей и диапазона записей на странице.
 * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/data-pagination/">здесь</a>.
 * @variant demand Навигация по кнопке "Ещё".
 * Список отображается в виде "бесконечной ленты" записей.
 * Загрузка данных происходит при нажатии на кнопку "Ещё", отображаемой в конце списка.
 * Можно настроить отображение числа оставшихся записей.
 * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/button-more/">здесь</a>.
 * @variant maxCount Загрузка до достижения заданного числа записей.
 * Позволяет прекратить загрузку при достижении заданного количества записей.
 * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/portion-loading/#max-count">здесь</a>.
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
 * @typedef {Enum} CursorDirection
 * @description Направление выборки при навигации по курсору.
 * @variant forward Вниз.
 * @variant backward Вверх.
 * @variant bothways В обоих направлениях.
 */

/*
 * @typedef {Enum} CursorDirection
 * @variant forward loading data after positional record.
 * @variant backward loading data before positional record.
 * @variant bothways loading data in both directions relative to the positional record.
 */
export enum CursorDirection {
    backward = 'backward',
    forward = 'forward',
    bothways = 'bothways'
}

/**
 * @typedef {String} TNavigationDirection
 * @description Направление выборки для режима работы с источником данных <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#cursor">Навигация по курсору</a>.
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

/*
 * @typedef {Object} IBasePositionSourceConfig
 * @description Конфигурация источника данных для перезагрузки при навигации по курсору.
 * Подробнее о данном типе навигации читайте {@link /doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/cursor/ здесь}.
 * @property {String|Array.<String>} position Начальная позиция для курсора.
 * @property {TNavigationDirection} direction Направление выборки.
 * @property {Number} limit Количество записей, которые запрашиваются при выборке.
 */

export interface IBasePositionSourceConfig {
    position?: unknown[] | unknown;
    direction?: TNavigationDirection;
    limit?: number;
    multiNavigation?: boolean;
}

/**
 * @name Controls/_interface/INavigation/IBasePositionSourceConfig#position
 * @cfg {String|Array.<String>} position Начальная позиция для курсора.
 * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-position">здесь</a>.
 */
/**
 * @name Controls/_interface/INavigation/IBasePositionSourceConfig#direction
 * @cfg {TNavigationDirection} direction Направление выборки.
 * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-direction">здесь</a>.
 */
/**
 * @name Controls/_interface/INavigation/IBasePositionSourceConfig#limit
 * @cfg {Number} limit Количество записей, которые запрашиваются при выборке.
 * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-limit">здесь</a>.
 */
/**
 * @name Controls/_interface/INavigation/INavigationPositionSourceConfig#field
 * @cfg {String|Array.<String>} field field Имя поля или массив с именами полей, для которых в целевой таблице БД создан индекс.
 * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-field">здесь</a>.
 */

/**
 * @typedef {Object} INavigationPositionSourceConfig
 * @description Параметры работы с источником данных для режима <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source">Навигация по курсору</a>.
 * @property {String|Array.<String>} field Имя поля или массив с именами полей, для которых в целевой таблице БД создан индекс.
 * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-field">здесь</a>.
 * @property {String|Array.<String>} position Начальная позиция для курсора.
 * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-position">здесь</a>.
 * @property {TNavigationDirection} direction Направление выборки.
 * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-direction">здесь</a>.
 * @property {Number} limit Количество записей, которые запрашиваются при выборке.
 * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-limit">здесь</a>.
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

/*
 * @typedef {Object} IBasePageSourceConfig
 * @description Конфигурация для постраничной навигации.
 * @property {Number} page Номер загружаемой страницы.
 * @property {Number} pageSize Размер загружаемой страницы.
 */

export interface IBasePageSourceConfig {
    page?: number;
    pageSize: number;
    multiNavigation?: boolean;
}

/**
 * @typedef {Object} INavigationPageSourceConfig
 * @description Параметры работы с источником данных для режима <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#page">Навигация с фиксированным количеством загружаемых записей</a>.
 * @property {Number} page Номер загружаемой страницы.
 * @property {Number} pageSize Размер загружаемой страницы.
 * @property {Boolean} hasMore Признак наличия записей для загрузки. Подробнее об использовании параметра читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#data-parametr-hasmore">здесь</a>.
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
 * @description Параметры режима <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/">работы с источником данных</a>.
 * Параметры для режима {@link Controls/interface:INavigation/INavigationPositionSourceConfig.typedef Навигация по курсору}.
 * Параметры для режима {@link Controls/interface:INavigation/INavigationPageSourceConfig.typedef Навигация с фиксированным количеством загружаемых записей}.
 */
/*
 * @typedef {Object} INavigationSourceConfig
 * @description Source configuration for both page-based and position-based (cursor) navigation.
 */
export type INavigationSourceConfig = INavigationPositionSourceConfig | INavigationPageSourceConfig;
export type IBaseSourceConfig = IBasePositionSourceConfig | IBasePageSourceConfig;

/**
 * @typedef {String} TNavigationTotalInfo
 * @description Допустимые значения для параметра {@link Controls/interface:INavigation/TNavigationTotalInfo.typedef totalInfo}.
 * @variant basic Отображается только общее число записей.
 * @variant extended Отображается общее число записей, номера первой и последней записей на текущей странице, а также размер страницы.
 */
export type TNavigationTotalInfo = 'basic' | 'extended';

/**
 * @typedef {String} TNavigationPagingMode
 * @variant hidden Предназначен для отключения отображения пейджинга в реестре.
 * @variant basic Предназначен для пейджинга в реестре с подгрузкой по скроллу.
 * @variant edge Предназначен для пейджинга с отображением одной команды прокрутки. Отображается кнопка в конец, либо в начало, в зависимости от положения.
 * @variant end Предназначен для пейджинга с отображением одной команды прокрутки. Отображается только кнопка в конец.
 * @variant numbers Предназначен для пейджинга с подсчетом записей и страниц.
 * @variant direct Значение устарело и будет удалено. Используйте значение basic.
 */
export type TNavigationPagingMode = 'hidden' | 'basic' | 'edge' | 'end' | 'numbers' | 'direct';

/**
 * @typeof {String} TNavigationPagingPadding
 * @variant default Предназначен для отображения отступа под пэйджинг.
 * @variant null Предназначен для отключения отображения отступа под пэйджинг.
 */
type TNavigationPagingPadding = 'default' | 'null';

/**
 * @typeof {String} TNavigationPagingPosition
 * @variant left Отображения пэйджинга слева.
 * @variant right Отображения пэйджинга справа.
 */
type TNavigationPagingPosition= 'left' | 'right';

/**
 * @typedef {Object} INavigationViewConfig
 * @description Конфигурация <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/">визуального представления навигации</a>.
 * @property {TNavigationPagingMode} [pagingMode=hidden] Внешний вид пэйджинга. Позволяет для каждого конкретного реестра задать внешний вид в зависимости от требований к интерфейсу.
 * Пример использования свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/">здесь</a>.
 * @property {TNavigationTotalInfo} [totalInfo=basic] Режим отображения информационной подписи.
 * Пример использования свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/data-pagination/">здесь</a>.
 * @property {Number} [maxCountValue=undefined] Предельное число записей, по достижении которого подгрузка записей прекращается.
 * Подробнее об использовании свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/portion-loading/#max-count">здесь</a>.
 * @property {Boolean} [showEndButton=false] Видимость кнопки перехода в конец списка.
 * Когда параметр принимает значение true, кнопка отображается.
 * Пример использования свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/infinite-scrolling/">здесь</a>.
 * @property {TNavigationPagingPadding} [pagingPadding=default] Опция управляет отображением отступа под пэйджинг.
 * @property {TNavigationPagingPosition} [pagingPosition=right] Опция управляет позицией пэйджинга.
 */
export interface INavigationViewConfig {
    pagingMode?: TNavigationPagingMode;
    totalInfo?: TNavigationTotalInfo;
    maxCountValue?: number;
    showEndButton?: boolean;
    pagingPadding?: TNavigationPagingPadding;
    pagingPosition?: TNavigationPagingPosition;
}

/**
 * @name Controls/_interface/INavigation/INavigationViewConfig#pagingMode
 * @cfg {TNavigationPagingMode} [pagingMode=hidden] Внешний вид пэйджинга. Позволяет для каждого конкретного реестра задать внешний вид в зависимости от требований к интерфейсу.
 * Пример использования свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/">здесь</a>.
 */
/**
 * @name Controls/_interface/INavigation/INavigationViewConfig#totalInfo
 * @cfg {TNavigationTotalInfo} [totalInfo=basic] Режим отображения информационной подписи.
 * Пример использования свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/data-pagination/">здесь</a>.
 */
/**
 * @name Controls/_interface/INavigation/INavigationViewConfig#maxCountValue
 * @cfg {Number} maxCountValue Предельное число записей, по достижении которого подгрузка записей прекращается.
 * Подробнее об использовании свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/portion-loading/#max-count">здесь</a>.
 */
/**
 * @name Controls/_interface/INavigation/INavigationViewConfig#showEndButton
 * @cfg {Boolean} [showEndButton=false] Видимость кнопки перехода в конец списка.
 * Когда параметр принимает значение true, кнопка отображается.
 * Пример использования свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/infinite-scrolling/">здесь</a>.
 */
/**
 * @name Controls/_interface/INavigation/INavigationViewConfig#pagingPadding
 * @cfg {TNavigationPagingPadding} [pagingPadding=default] Опция управляет отображением отступа под пэйджинг.
 */
/**
 * @name Controls/_interface/INavigation/INavigationViewConfig#pagingPosition
 * @cfg {TNavigationPagingPosition} [pagingPosition=right] Опция управляет позицией пэйджинга.
 */

/**
 * @typedef {Object} INavigationOptionValue
 * @description Конфигурация навигации в <a href="/doc/platform/developmentapl/interface-development/controls/list/">списке</a>.
 * Подробнее о настройке навигации читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/">здесь</a>.
 * @property {TNavigationSource} source Режим работы с источником данных.
 * @property {TNavigationView} view Вид визуального представления навигации.
 * @property {INavigationSourceConfig} sourceConfig Конфигурация режима работы с источником данных.
 * @property {INavigationViewConfig} viewConfig Конфигурация вида визуального представления навигации.
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
 * @name Controls/_interface/INavigation/INavigationOptionValue#source
 * @cfg {TNavigationSource} source Режим работы с источником данных.
 */
/**
 * @name Controls/_interface/INavigation/INavigationOptionValue#view
 * @cfg {TNavigationView} view Вид визуального представления навигации.
 */
/**
 * @name Controls/_interface/INavigation/INavigationOptionValue#sourceConfig
 * @cfg {INavigationSourceConfig} sourceConfig Конфигурация режима работы с источником данных.
 */
/**
 * @name Controls/_interface/INavigation/INavigationOptionValue#viewConfig
 * @cfg {INavigationViewConfig} viewConfig Конфигурация вида визуального представления навигации.
 */

/**
 * Интерфейс для контролов, поддерживающих навигацию.
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

export default interface INavigation {
    readonly '[Controls/_interface/INavigation]': boolean;
}

/**
 * @name Controls/_interface/INavigation#navigation
 * @cfg {INavigationOptionValue} Конфигурация навигации в <a href="/doc/platform/developmentapl/interface-development/controls/list/">списке</a>.
 * @remark
 * Подробнее о навигации в списках читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/">здесь</a>.
 * @example
 * В этом примере в списке будут отображаться 2 элемента.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.list:View
 *    keyProperty="id"
 *    source="{{_source}}"
 *    navigation="{{_navigation}}" />
 * </pre>
 * <pre class="brush: js">
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
 * @demo Controls-demo/list_new/Navigation/ScrollPaging/Index
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
