export type IDirection = 'up' | 'down';
/**
 * Интерфейс для поддержки виртуального скроллирования в списках.
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
 * @typedef {String} Controls/_list/interface/IVirtualScrollConfig/IVirtualScrollMode
 * @variant remove Скрытые элементы удаляются из DOM.
 * @variant hide Скрытые элементы скрываются из DOM с помощью ws-hidden.
 */
export type IVirtualScrollMode = 'remove' | 'hide';

/**
 * @typedef {Object} Controls/_list/interface/IVirtualScrollConfig/VirtualScrollConfig
 * @property {number} pageSize Размер виртуальной страницы указывает максимальное количество одновременно отображаемых элементов в списке.
 * @property {IVirtualScrollMode} [mode=remove] Режим скрытия элементов в виртуальном скроллинге.
 * @property {number} [viewportHeight=undefined] Высота вьюпорта контейнера, в котором лежит список.
 * @property {number} [segmentSize] Количество подгружаемых элементов при скроллировании. По умолчанию равен четверти размера виртуальной страницы, который задан в опции pageSize.
 * @property {string} [itemHeightProperty=undefined] Поле в элементе, которое содержит его высоту для оптимистичного рендеринга.
 */

/**
 * @name Controls/_list/interface/IVirtualScrollConfig#virtualScrollConfig
 * @cfg {Controls/_list/interface/IVirtualScrollConfig/VirtualScrollConfig.typedef} Конфигурация виртуального скроллинга.
 * Виртуальный скроллинг работает только при включенной <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/">навигации</a>.
 * @remark Подробнее о конфигурации виртуального скролла читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/performance-optimization/virtual-scroll/">здесь</a>.
 * @example
 * В следующем примере показана конфигурация виртуального скролла: в свойстве pageSize задан размер виртуальной страницы.
 * Также задана конфигурация навигации в опции navigation.
 * <pre class="brush: html; highlight: [5,6]">
 * <!-- WML -->
 * <Controls.scroll:Container ...>
 *     <Controls.list:View
 *         source="{{_viewSource}}"
 *         keyProperty="id"
 *         navigation="{{_options.navigation}}">
 *         <ws:virtualScrollConfig pageSize="{{100}}"/>
 *     </Controls.list:View>
 * </Controls.scroll:Container>
 * </pre>
 * @demo Controls-demo/list_new/VirtualScroll/ConstantHeights/Default/Index
 * @see Controls/interface/INavigation#navigation
 */
