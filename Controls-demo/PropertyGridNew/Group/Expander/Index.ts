import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/PropertyGridNew/Group/Expander/Expander"
import {getEditingObject, getSource} from 'Controls-demo/PropertyGridNew/resources/Data';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _editingObject: object = null;
    protected _source: object[] = null;

    protected _beforeMount(): void {
        this._editingObject = getEditingObject();
        this._source = getSource();
    }
}
