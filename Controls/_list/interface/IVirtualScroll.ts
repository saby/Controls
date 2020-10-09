export type IDirection = 'up' | 'down';
export interface IVirtualScrollConfig {
    pageSize: number;
    segmentSize: number;
    itemHeightProperty: string;
    viewportHeight: number;
    mode: 'hide'|'remove';
}

/**
 * @typedef {object} IVirtualScrollConfig
 * @property {number} pageSize Размер виртуальной страницы указывает максимальное количество одновременно отображаемых элементов в списке.
 * @property {IVirtualScrollMode} mode Режим скрытия элементов в виртуальном скроллинге.
 * @property {number} [viewportHeight=undefined] Высота вьюпорта контейнера, в котором лежит список.
 * @property {number} segmentSize Количество подгружаемых элементов при скроллировании.
 * @property {string} [itemHeightProperty=undefined] Поле в элементе, которое содержит его высоту для оптимистичного рендеринга.
 */

/**
 * Интерфейс для поддержки виртуального скроллирования в списках.
 *
 * @interface Controls/_list/interface/IVirtualScroll
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for lists that can use virtual scroll.
 *
 * @interface Controls/_list/interface/IVirtualScroll
 * @public
 * @author Авраменко А.С.
 */

/**
 * @typedef {String} IVirtualScrollMode
 * @variant remove Скрытые элементы удаляются из DOM.
 * @variant hide Скрытые элементы скрываются из DOM с помощью ws-hidden.
 */
export type IVirtualScrollMode = 'remove' | 'hide';

/**
 * @name Controls/_list/interface/IVirtualScroll#virtualScrollConfig
 * @cfg {IVirtualScrollConfig} Конфигурация виртуального скроллинга.
 * Виртуальный скроллинг работает только при включенной <a href="/doc/platform/developmentapl/interface-development/controls/list/list/navigation/">навигации</a>.
 * @remark Подробнее о конфигурации виртуального скролла читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/list/virtual-scroll/">здесь</a>.
 * @example
 * В следующем примере показана конфигурация виртуального скролла: в свойстве pageSize задан размер виртуальной страницы.
 * Также задана конфигурация навигации в опции navigation.
 * <pre class="brush: js; highlight: [4,5]">
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
