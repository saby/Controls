export type IDirection = 'up' | 'down';
/**
 * Интерфейс для поддержки {@link /doc/platform/developmentapl/interface-development/controls/list/performance-optimization/virtual-scroll/ виртуального скроллирования} в списках.
 *
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for lists that can use virtual scroll.
 *
 * @interface Controls/_list/interface/IVirtualScrollConfig
 * @public
 * @author Авраменко А.С.
 */
export interface IVirtualScrollConfig {
    pageSize?: number;
    segmentSize?: number;
    itemHeightProperty?: string;
    viewportHeight?: number;
    mode?: 'hide'|'remove';
}

/**
 * Режимы управления элементами виртуального скроллинга.
 * @typedef {String} Controls/_list/interface/IVirtualScrollConfig/IVirtualScrollMode
 * @variant remove Скрытые элементы удаляются из DOM.
 * @variant hide Скрытые элементы скрываются из DOM с помощью ws-hidden.
 */
export type IVirtualScrollMode = 'remove' | 'hide';

/**
 * Набор свойств, которыми можно оптимизировать производительность виртуального скроллинга.
 * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/performance-optimization/virtual-scroll/#optimisation здесь}.
 * @typedef {Object} Controls/_list/interface/IVirtualScrollConfig/VirtualScrollConfig
 * @property {number} pageSize Количество отображаемых элементов при инициализации списка.
 * @property {IVirtualScrollMode} [mode=remove] Режим управления элементами виртуального скроллинга.
 * @property {number} [viewportHeight=undefined] Высота контейнера со списком.
 * @property {number} [segmentSize=pageSize/4] Количество подгружаемых элементов при скроллировании. По умолчанию равен четверти размера виртуальной страницы, который задан в опции pageSize.
 * @property {string} [itemHeightProperty=undefined] Имя поля, которое содержит высоту элемента.
 */

/**
 * @name Controls/_list/interface/IVirtualScrollConfig#virtualScrollConfig
 * @cfg {Controls/_list/interface/IVirtualScrollConfig/VirtualScrollConfig.typedef} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/performance-optimization/virtual-scroll/ виртуального скролла}.
 * @remark
 * Виртуальный скролл работает только при включенной {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/ навигации} в виде {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/infinite-scrolling/ бесконечной прокрутки}.
 * @example
 * В следующем примере показана конфигурация виртуального скролла: в свойстве pageSize задан размер виртуальной страницы.
 * Также задана конфигурация навигации в опции navigation.
 * <pre class="brush: html; highlight: [4,5]">
 * <!-- WML -->
 * <Controls.scroll:Container ...>
 *     <Controls.list:View
 *         source="{{_viewSource}}"
 *         navigation="{{_options.navigation}}">
 *         <ws:virtualScrollConfig pageSize="{{100}}"/>
 *     </Controls.list:View>
 * </Controls.scroll:Container>
 * </pre>
 * @demo Controls-demo/list_new/VirtualScroll/ConstantHeights/Default/Index
 * @see Controls/interface:INavigation#navigation
 */


/**
 * @event Происходит при использовании виртуального скролла, когда список находится в такой позиции, что сверху и снизу списка есть скрытые (или доступные для загрузки) элементы.
 * @remark По этому событию скрывается контент {@link Controls/scroll:VirtualScrollContainer} с опцией position, соответствующей параметру в событии.
 * @name Controls/_list/interface/IVirtualScrollConfig#enableVirtualNavigation
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {'top' | 'bottom'} position Положение, в котором будет скрыт контент Controls/scroll:VirtualScrollContainer.
 * @see disableVirtualNavigation
 */

/**
 * @event Происходит при использовании виртуального скролла, когда список находится в такой позиции, что сверху или снизу списка нет скрытых (или доступных для загрузки) элементов.
 * @remark По этому событию показывается контент {@link Controls/scroll:VirtualScrollContainer} с опцией position соответствующей параметру в событии.
 * @name Controls/_list/interface/IVirtualScrollConfig#disableVirtualNavigation
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {'top' | 'bottom'} position Положение, в котором будет скрыт контент Controls/scroll:VirtualScrollContainer.
 * @see enableVirtualNavigation
 */