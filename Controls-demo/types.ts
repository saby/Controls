import { IHeaderCell } from 'Controls/_grid/interface/IHeaderCell';
import {RecordSet} from 'Types/collection';

export interface IHeader extends IHeaderCell {
    title: string
};

export type TItemsReadyCallback = (items: RecordSet) => void;
export type TRoot = string | number | null;

export type TExpandOrColapsItems = number[] | null[];

export interface INavigation {
    source: string,
    view: string,
    sourceConfig: {
        pageSize: number,
        page: number,
        hasMore?: boolean
    },
    viewConfig?: {
        pagingMode?: string
        maxCountValue?: number
    }
};
