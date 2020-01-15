export type IDirection = 'up' | 'down';
export interface IVirtualScrollConfig {
    pageSize: number;
    segmentSize: number;
    itemHeightProperty: string;
    viewportHeight: number;
}

/**
 * @typedef {object} IVirtualScrollConfig
 * @property {number} pageSize Размер виртуальной страницы указывает максимальное количество одновременно отображаемых элементов в списке.
 * @property {IVirtualScrollMode} mode Режим скрытия записей в виртуальном скроллинге
 * @property {number} viewportHeight Высота вьюпорта контейнера в котором лежит список
 * @property {number} segmentSize Количество подгружаемых элементов при скроллировании
 * @property {string} itemHeightProperty Поле в элементе, которое содержит его высоту для оптимистичного рендеринга
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
 * @name Controls/_list/interface/IVirtualScroll#virtualScrolling
 * @cfg {Boolean} Включает и выключает виртуальный скролл в списке.
 * @remark
 * Также необходимо установить "navigation" в значение "infinity".
 */

/*
 * @name Controls/_list/interface/IVirtualScroll#virtualScrolling
 * @cfg {Boolean} Turns on and off virtual scrolling in the list.
 * @remark
 * It is also necessary to set the view navigation to 'infinity'
 */ 

/**
 * @deprecated
 * @name Controls/_list/interface/IVirtualScroll#virtualPageSize
 * @cfg {Number} Размер виртуальной страницы указывает максимальное количество одновременно отображаемых элементов в списке.
 * @default 100
 * @remark
 * Оптимальное значение параметра virtualPageSize можно рассчитать по формуле: <b>virtualPageSize = M + (2 * S)</b>, где
 * <ul>
 *     <li>M - максимальное количество элементов в клиентской области списка;</li>
 *     <li>S - количество элементов, которые будут добавлены/удалены по достижении конца списка отображаемых элементов.</li>
 * </ul>
 * <b>Примечание для Controls/Grid:View и Controls/TreeGrid:View</b>: значение опции virtualPageSize должно быть меньше 1000/общее количество столбцов в таблице.
 */

/*
 * @name Controls/_list/interface/IVirtualScroll#virtualPageSize
 * @cfg {Number} The size of the virtual page indicates maximum number of simultaneously displayed items in the list.
 * @default 100
 * @remark
 * The optimal value of the virtualPageSize option can be calculated by the formula: <b>virtualPageSize = M + (2 * S)</b>, where
 * <ul>
 *     <li>M - maximum number of items in the client area of the list;</li>
 *     <li>S - number of items that will be inserted/removed on reaching the end of displayed items.</li>
 * </ul>
 * <b>Note for Controls/Grid:View and Controls/TreeGrid:View</b>: the value of the virtualPageSize should be less then 1000/total columns count in grid.
 */

/**
 * @deprecated
 * @name Controls/_list/interface/IVirtualScroll#virtualSegmentSize
 * @cfg {number} Количество подгружаемых элементов при скроллировании
 * @remark Если опция не задана, то virtualSegmentSize высчитывается по формуле virtualPageSize / 4.
 */

/**
 * @typedef {string} IVirtualScrollMode
 * @variant remove Скрытые записи удаляются из DOM
 * @variant hide Скрытые записи скрываются из DOM с помощью ws-hidden
 */
export type IVirtualScrollMode = 'remove' | 'hide';

/**
 * @deprecated
 * @name Controls/_list/interface/IVirtualScroll#virtualScrollMode
 * @cfg {IVirtualScrollMode} Режим скрытия записей в виртуальном скроллинге
 * @default remove
 */

/**
 * @name Controls/_list/interface/IVirtualScroll#virtualScrollConfig
 * @cfg {IVirtualScrollConfig} Конфигурация виртуального скроллинга
 */