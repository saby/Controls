export interface IMonthListVirtualPageSizeOptions {
   virtualPageSize: number;
}

/**
 * Интерфейс для контролов, которые основаны на {@link Controls/calendar:MonthList} и поддерживающие изменение виртуальной страницы.
 * @interface Controls/_calendar/interfaces/IMonthListVirtualPageSize
 * @public
 * @author Красильников А.С.
 */
export interface IMonthListVirtualPageSize {
   readonly '[Controls/_calendar/interfaces/IMonthListVirtualPageSize]': boolean;
}

/**
 * @name Controls/_calendar/interfaces/IMonthListVirtualPageSize#virtualPageSize
 * @cfg {Number} Размер виртуальной страницы. Задаёт максимальное количество элементов, которые одновременно отображаются в списке.
 * @default 6
 */
