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
 * @property {IVirtualScrollMode} mode Режим скрытия записей в виртуальном скроллинге
 * @property {number} [viewportHeight=undefined] Высота вьюпорта контейнера в котором лежит список
 * @property {number} segmentSize Количество подгружаемых элементов при скроллировании
 * @property {string} [itemHeightProperty=undefined] Поле в элементе, которое содержит его высоту для оптимистичного рендеринга
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
 * @variant remove Скрытые записи удаляются из DOM.
 * @variant hide Скрытые записи скрываются из DOM с помощью ws-hidden.
 */
export type IVirtualScrollMode = 'remove' | 'hide';

/**
 * @name Controls/_list/interface/IVirtualScroll#virtualScrollConfig
 * @cfg {IVirtualScrollConfig} Конфигурация виртуального скроллинга.
 */
