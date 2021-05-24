import {QueryNavigationType, QueryOrderSelector, QueryWhereExpression, QuerySelectExpression} from 'Types/source';

export type Direction = 'up' | 'down';

export interface IQueryParamsMeta {
   navigationType?: QueryNavigationType;
   hasMore?: boolean;
}
export interface IQueryParams {
   meta?: IQueryParamsMeta;
   limit?: number;
   offset?: number;
   filter?: QueryWhereExpression<any>;
   sorting?: QueryOrderSelector;
   select?: QuerySelectExpression;
}
