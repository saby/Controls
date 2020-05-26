/**
 * Модуль возвращает метод, с помощью которого можно запросить данные с учетом фильтрации и сортировки.
 * <h2>Аргументы функции</h2>
 *
 * Функция на вход приниает объект с полями:
 * * source: SbisService - источник данных;
 * * filterButtonSource: Array - элементы {@link Controls/filter:Controller#filterButtonSource FilterButton};
 * * fastFilterSource: Array - элементы {@link Controls/filter:Controller#fastFilterSource FastFilter};
 * * navigation: object - навигация для получения данных;
 * * historyId: string - идентификатор для получения истории фильтрации;
 * * groupHistoryId: string - идентификатор для получения состояния группировки;
 * * filter: FilterObject - фильтр для получения данных;
 * * sorting: SortingObject - сортировка для получения данных;
 * * propStorageId: string - идентификатор стора, в котором хранится сохраненная пользовательская сортировка;
 *
 * @class Controls/_dataSource/requestDataUtil
 * @public
 * @author Сухоручкин А.С.
 * @public
 */

import {Controller as SourceController} from 'Controls/source';
import {loadSavedConfig} from 'Controls/Application/SettingsController';
import {RecordSet} from 'Types/collection';
import {SbisService} from 'Types/source';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';
import {Logger} from 'UI/Utils';
import groupUtil from 'Controls/_dataSource/GroupUtil';

type HistoryItems = object[];
type SortingObject = object[];
type FilterObject = Record<string, unknown>;

interface ISorting {
   sorting: SortingObject;
}
interface IFilter {
   filter: FilterObject;
   historyItems: HistoryItems;
}
export interface IRequestDataResult {
   data: RecordSet;
   filter?: FilterObject;
   sorting?: SortingObject;
   historyItems?: HistoryItems;
   collapsedGroups?: string[];
}

export interface ISourceConfig {
   source: SbisService;
   filterButtonSource?: object[];
   fastFilterSource?: object[];
   navigation?: object;
   groupHistoryId?: string;
   historyId?: string;
   filter?: FilterObject;
   sorting?: SortingObject;
   historyItems?: HistoryItems;
   propStorageId: string;
}

const HISTORY_FILTER_TIMEOUT = 1000;

export default function requestDataUtil(cfg: ISourceConfig): Promise<IRequestDataResult> {
   const sourceController = new SourceController({
      source: cfg.source,
      navigation: cfg.navigation
   });
   let sortingPromise;
   let filterPromise;
   let collapsedGroupsPromise;
   if (cfg.historyId && cfg.filterButtonSource && cfg.filter) {
      filterPromise = import('Controls/filter').then((filterLib): Promise<IFilter> => {
         return filterLib.Controller.getCalculatedFilter(cfg);
      });
      filterPromise = wrapTimeout(filterPromise, HISTORY_FILTER_TIMEOUT).catch(() => {
         Logger.info('Controls.dataSource:requestDataUtil: Данные фильтрации не загрузились за 1 секунду');
      });
   }
   if (cfg.propStorageId) {
      sortingPromise = loadSavedConfig(cfg.propStorageId, ['sorting']);
      sortingPromise = wrapTimeout(sortingPromise, HISTORY_FILTER_TIMEOUT).catch(() => {
         Logger.info('Controls.dataSource:requestDataUtil: Данные сортировки не загрузились за 1 секунду');
      });
   }
   if (cfg.groupHistoryId) {
      collapsedGroupsPromise = groupUtil.restoreCollapsedGroups(cfg.groupHistoryId);
   }

   return Promise.all([
       filterPromise,
      sortingPromise,
      collapsedGroupsPromise
   ]).then(([filterObject, sortingObject, collapsedGroups]: [IFilter, ISorting, string[]]) => {
      const filter = filterObject ? filterObject.filter : cfg.filter;
      const historyItems = filterObject ? filterObject.historyItems : null;
      const sorting = sortingObject ? sortingObject.sorting : cfg.sorting;
      if (collapsedGroups) {
         filter.collapsedGroups = collapsedGroups;
      }
      const result = {filter, sorting, historyItems, collapsedGroups};

      return sourceController.load(filter, sorting).then((data: RecordSet) => {
         return {...result, data};
      }).catch((data: Error) => {
         return {...result, data};
      });
   });
}
