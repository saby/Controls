import {TemplateFunction} from 'UI/Base';

export interface IFooter {
    template?: TemplateFunction;
    startColumn?: number;
    endColumn?: number;
}

export type TFooter = IFooter[];
