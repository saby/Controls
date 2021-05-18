export type IDirection = 'up' | 'down';
/**
 * Интерфейс для поддержки {@link /doc/platform/developmentapl/interface-development/controls/list/performance-optimization/virtual-scroll/ виртуального скроллирования} в списках.
 *
 * @interface Controls/_list/interface/IVirtualScrollConfig
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
 * @property {number} [segmentSize] Количество подгружаемых элементов при скроллировании. По умолчанию равен четверти размера виртуальной страницы, который задан в опции pageSize.
 * @property {string} [itemHeightProperty=undefined] Имя поля, которое содержит высоту элемента.
 */

/**
 * @name Controls/_list/interface/IVirtualScrollConfig#virtualScrollConfig
 * @cfg {Controls/_list/interface/IVirtualScrollConfig/VirtualScrollConfig.typedef} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/performance-optimization/virtual-scroll/ виртуального скролла}.
 * @remark
 * Виртуальный скролл работает только при включенной {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/ навигации}.
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
