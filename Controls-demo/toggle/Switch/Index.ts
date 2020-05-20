import {Control, TemplateFunction} from "UI/Base";
import * as Template from "wml!Controls-demo/toggle/Switch/Template";

export default class extends Control {
    protected _template: TemplateFunction = Template;

    static styles: string[] = ['Controls-demo/Controls-demo'];
}
