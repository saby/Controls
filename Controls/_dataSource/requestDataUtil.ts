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
import {Controller as FilterController} from 'Controls/filter';
import {loadSavedConfig} from 'Controls/Application/SettingsController';
import {RecordSet} from 'Types/collection';
import {SbisService} from 'Types/source';

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
}

export interface ISourceConfig {
   source: SbisService;
   filterButtonSource?: object[];
   fastFilterSource?: object[];
   navigation?: object;
   historyId?: string;
   filter?: FilterObject;
   sorting?: SortingObject;
   historyItems?: HistoryItems;
   propStorageId: string;
}

export default function requestDataUtil(cfg: ISourceConfig): Promise<IRequestDataResult> {
   const sourceController = new SourceController({
      source: cfg.source,
      navigation: cfg.navigation
   });
   let sortingPromise;
   let filterPromise;
   if (cfg.historyId && cfg.filterButtonSource && cfg.filter) {
      filterPromise = FilterController.getCalculatedFilter(cfg);
   }
   if (cfg.propStorageId) {
      sortingPromise = loadSavedConfig(cfg.propStorageId, ['sorting']);
   }

   return Promise.all([filterPromise, sortingPromise]).then(([filterObject, sortingObject]: [IFilter, ISorting]) => {
      const filter = filterObject ? filterObject.filter : cfg.filter;
      const historyItems = filterObject ? filterObject.historyItems : null;
      const sorting = sortingObject ? sortingObject.sorting : cfg.sorting;

      return sourceController.load(filter, sorting).then((data: RecordSet) => {
         return {
            data,
            filter,
            sorting,
            historyItems
         };
      });
   });
}
