import {TemplateFunction} from 'UI/Base';

export interface IEmptyTemplateColumn {
    template?: TemplateFunction;
    startColumn?: number;
    endColumn?: number;
}

export type TEmptyTemplateColumns = IEmptyTemplateColumn[];
