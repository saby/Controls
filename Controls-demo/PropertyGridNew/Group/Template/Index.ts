import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/PropertyGridNew/Group/Template/Template"
import {getEditingObject, getSource} from 'Controls-demo/PropertyGridNew/resources/Data';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _editingObject: object = null;
    protected _source: object[] = null;

    protected _beforeMount(): void {
        this._editingObject = getEditingObject();
        this._source = getSource();
    }
}
