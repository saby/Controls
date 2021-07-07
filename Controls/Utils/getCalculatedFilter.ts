import {ICalculateFilterParams, ICalculatedFilter} from 'Controls/filter';
/**
 * Утилита для получения фильтра с историей
 * @class Controls/Utils/getCalculatedFilter
 * @public
 * @author Михайлов С.Е
 */

/**
 * @typedef {Object} ICalculateFilterParams;
 * @description Параметры метода
 * @property {Object[]} historyItems? {@link  Controls/_filter/Controller#historyItems}
 * @property {IFilterItem} filterButtonSource {@link  Controls/_filter/Controller#filterButtonSource}
 * @property {String} historyId? {@link Controls/_filter/Controller#historyId}
 * @property {Object} filter {@link Controls/list#filter}
 */

/**
 * @typedef {Object} ICalculatedFilter;
 * @description Параметры метода
 * @property {Object[]} historyItems {@link  Controls/_filter/Controller#historyItems}
 * @property {IFilterItem} filterButtonItems {@link  Controls/_filter/Controller#filterButtonSource}
 * @property {Object} filter {@link Controls/list#filter}
 */

/**
 * Получить фильтр и структуру фильтров с учетом истории
 * @function Controls/Utils/getCalculatedFilter#getCalculatedFilter
 * @param params {ICalculateFilterParams}
 * @returns Promise<ICalculatedFilter>
 */
export default function getCalculatedFilter(params: ICalculateFilterParams): Promise<ICalculatedFilter> {
    return import('Controls/filter').then((filter) => {
        return filter.ControllerClass.getCalculatedFilter(params);
    });
}
