import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/CaptionColumnOptions/Index';
import {getEditingObject, getHierarchySource} from 'Controls-demo/PropertyGridNew/resources/Data';

export default class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editingObject: object;
    protected _source: object[];

    protected _beforeMount(): void {
        this._editingObject = getEditingObject();
        this._source = getHierarchySource();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo',
        'Controls-demo/PropertyGridNew/PropertyGrid'];
}
