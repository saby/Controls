import { Control, TemplateFunction } from 'UI/Base';
import Template from "wml!Controls-demo/treeGrid/EditArrow/EditArrow";

export default class extends Control {
    protected _template: TemplateFunction = Template;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
