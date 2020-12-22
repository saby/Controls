import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Results/Results';

export default class extends Control {
    protected _template: TemplateFunction = Template;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
