import { IColumn } from 'Controls/grid';

export interface IData {
    key: number;
    number?: number;
    country?: string;
    capital?: string;
    population?: number;
    square?: number;
    populationDensity?: number;
    date?: string;
    time?: string;
    name?: string;
    message?: string;
    photo?: string;
    state?: string;
    fullName?: string;
    invoice?: number;
    documentSign?: number;
    documentNum?: number;
    taxBase?: number;
    document?: string;
    documentDate?: null | string;
    serviceContract?: null | string;
    description?: string;
    group?: string;
    shipper?: null | string;
    tagStyle?: null | string;
}

export interface IColumnRes extends IColumn {
    result?: number;
    results?: number;
}
