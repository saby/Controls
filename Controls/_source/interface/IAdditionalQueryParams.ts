import {QueryNavigationType, QueryOrderSelector, QueryWhere} from 'Types/source';

export type Direction = 'up' | 'down';

export type DirectionCfg = 'before' | 'after' | 'both';

export interface IAdditionQueryParamsMeta {
   navigationType?: QueryNavigationType;
   hasMore?: boolean;
}
export interface IAdditionalQueryParams {
   meta?: IAdditionQueryParamsMeta;
   limit?: number;
   offset?: number;
   filter?: QueryWhere;
   sorting?: QueryOrderSelector;
}
