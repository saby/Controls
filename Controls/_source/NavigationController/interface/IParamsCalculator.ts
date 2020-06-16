import {IBaseSourceConfig, TNavigationDirection} from 'Controls/_interface/INavigation';
import INavigationStore from './INavigationStore';
import {IAdditionalQueryParams} from 'Controls/_interface/IAdditionalQueryParams';
import {RecordSet} from 'Types/collection';
export default interface IParamsCalculator {
     hasMoreData(store: INavigationStore, direction: TNavigationDirection): boolean;
     getQueryParams(
         store: INavigationStore,
         navigationQueryConfig: IBaseSourceConfig,
         direction: TNavigationDirection): IAdditionalQueryParams;
     updateQueryProperties(
         store: INavigationStore,
         list: RecordSet,
         navigationQueryConfig: IBaseSourceConfig,
         direction: TNavigationDirection
     ): any;
     destroy(): void;
}
