export interface IPrefetchParams {
    PrefetchMethod: string;
    PrefetchPages?: number;
    PrefetchIdColumn?: string;
    PrefetchHierarchyColumn?: string;
    PrefetchSessionLiveTime?: Date;
}

export interface IPrefetchOptions {
    prefetchParams: IPrefetchParams;
}

export interface IPrefetchHistoryParams {
    PrefetchSessionId: string;
    PrefetchDataValidUntil: Date;
}

/**
 * Интерфейс для контролов, поддерживающих кэширование данных.
 *
 * @interface Controls/_filter/IPrefetch
 * @public
 * @author Герасимов А.М.
 */

export default interface IPrefetch {
    readonly '[Controls/_filter/IPrefetch]': boolean;
}
/**
 * @typedef {Object} PrefetchParams
 * @property {String} PrefetchMethod метод, который необходимо вызвать для получения данных.
 * @property {Number} PrefetchLevels количество кэшируемых уровней иерархии. По умолчанию 2.
 * @property {String} PrefetchHierarchyColumn имя поля иерархии (для иерархических данных). По умолчанию "Раздел".
 * @property {String} PrefetchIdColumn  имя поля, идентифицирующего запись (для иерархических запросов). Если не передано, то берется первое поле из результата.
 * @property {Date} PrefetchSessionLiveTime время жизни сессии (тип данных TimeInterval). По умолчанию 1 день.
 */

/**
 * @name Controls/_filter/IPrefetch#prefetchParams
 * @cfg {PrefetchParams} Устанавливает конфигурацию для кэширования данных.
 * @remark
 * Подробнее о механизме кэширования отчетов вы можете прочитать в разделе
 * <a href='/doc/platform/application-optimization/reports-caching/'>Платформенный механизм кэширования</a>.
 */
