import {QueryNavigationType, QueryOrderSelector, QueryWhereExpression} from 'Types/source';

export type Direction = 'up' | 'down';

export interface IAdditionQueryParamsMeta {
   navigationType?: QueryNavigationType;
   hasMore?: boolean;
}
export interface IAdditionalQueryParams {
   meta?: IAdditionQueryParamsMeta;
   limit?: number;
   offset?: number;
   filter?: QueryWhereExpression<any>;
   sorting?: QueryOrderSelector;
}
