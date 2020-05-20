import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls-demo/list_new/ColumnsView/ColumnsView';

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
