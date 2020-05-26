/**
 * Модуль, который экспортирует набор функций-хэлперов для работы с кэшированием данных на {@link https://wi.sbis.ru/doc/platform/application-optimization/reports-caching/ сервисе кэширования}.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filter.less">переменные тем оформления</a>
 * 
 * @class Controls/_filter/Prefetch
 * @control
 * @author Герасимов А.М.
 */

/**
 * Возвращает дату создания кэша из метаданных переданного рекордсета
 * @function Controls/_filter/Prefetch#getPrefetchDataCreatedFromItems
 * @param {Types/collection:RecordSet} items
 * @returns {Date|null}
 * @example
 * <pre>
 *     import {Prefetch} from 'Controls/filter'
 *     const createDate = Prefetch.getPrefetchDataCreatedFromItems(loadedItems);
 * </pre>
 */

import {RecordSet} from 'Types/Collection';
import {Record} from 'Types/entity';
import {IPrefetchHistoryParams, IPrefetchParams} from './IPrefetch';

const PREFETCH_SESSION_ERROR = '00000000-0000-0000-0000-000000000000';
const PREFETCH_SESSION_FIELD = 'PrefetchSessionId';
const PREFETCH_DATA_VALID_FIELD = 'PrefetchDataValidUntil';
const PREFETCH_DATA_CREATED = 'PrefetchDataCreated';

function isPrefetchParamsValid(items: RecordSet): boolean {
    let sessionId;

    if (getPrefetchMeta(items)) {
        sessionId = getSessionId(items);
    }

    return sessionId && sessionId !== PREFETCH_SESSION_ERROR;
}

function getPrefetchMeta(items: RecordSet): Record {
    return items.getMetaData().results;
}

function getSessionId(items: RecordSet): string {
    return getPrefetchMeta(items).get(PREFETCH_SESSION_FIELD);
}

function getDataValid(items: RecordSet): Date {
    return getPrefetchMeta(items).get(PREFETCH_DATA_VALID_FIELD);
}

function getPrefetchFromHistory({prefetchParams}): IPrefetchHistoryParams|undefined {
    return prefetchParams;
}

function addPrefetchToHistory<T>(history: T, prefetchParams: IPrefetchHistoryParams|undefined): T {
    if (history && prefetchParams) {
        history.prefetchParams = prefetchParams;
    }
    return history;
}

function getPrefetchParamsForSave(items: RecordSet): IPrefetchHistoryParams|undefined {
    if (isPrefetchParamsValid(items)) {
        return {
            PrefetchSessionId: getSessionId(items),
            PrefetchDataValidUntil: getDataValid(items)
        };
    }
}

function applyPrefetchFromHistory(filter: object, history): object {
    const prefetchParams = getPrefetchFromHistory(history);
    let resultFilter;

    if (prefetchParams) {
        resultFilter = {...filter};
        resultFilter[PREFETCH_SESSION_FIELD] = prefetchParams[PREFETCH_SESSION_FIELD];
    } else {
        resultFilter = filter;
    }

    return resultFilter;
}

function applyPrefetchFromItems(filter: object, items: RecordSet): object {
    if (isPrefetchParamsValid(items)) {
        const sessionId = getSessionId(items);

        if (sessionId) {
            filter[PREFETCH_SESSION_FIELD] = sessionId;
        }
    }

    return  filter;
}

function prepareFilter(filter: Object, prefetchParams: IPrefetchParams): object {
    const clonedFiled = {...filter};
    return {...clonedFiled, ...prefetchParams || {}};
}

function needInvalidatePrefetch(history): boolean {
    const prefetchParams = getPrefetchFromHistory(history);
    let result = false;
    if (prefetchParams) {
        result = prefetchParams[PREFETCH_DATA_VALID_FIELD] < new Date();
    }
    return result;
}

function clearPrefetchSession(filter: object): object {
    const resultFilter = filter;
    delete filter[PREFETCH_SESSION_FIELD];
    return resultFilter;
}

function getPrefetchDataCreatedFromItems(items: RecordSet): Date|null {
    const prefetchMeta = getPrefetchMeta(items);
    let result = null;

    if (prefetchMeta) {
        result = prefetchMeta.get(PREFETCH_DATA_CREATED);
    }

    return result;
}

export default {
    applyPrefetchFromItems,
    applyPrefetchFromHistory,
    getPrefetchParamsForSave,
    addPrefetchToHistory,
    needInvalidatePrefetch,
    prepareFilter,
    clearPrefetchSession,
    getPrefetchFromHistory,
    getPrefetchDataCreatedFromItems
};
