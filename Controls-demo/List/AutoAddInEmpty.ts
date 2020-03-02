import {Control, TemplateFunction} from "UI/Base"
import * as template from "wml!Controls-demo/List/AutoAddInEmpty/AutoAddInEmpty"
import {Memory} from "Types/source"

export default class extends Control {
    protected _template: TemplateFunction = template;

    protected _source = new Memory({
        keyProperty: 'id',
        data: []
    });
}