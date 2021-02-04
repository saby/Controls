import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/Editors/Logic/Index';

export default class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _source: object[] = [
        {
            name: 'selected',
            caption: 'Logic editor',
            editorTemplateName: 'Controls/propertyGrid:LogicEditor'
        }
    ];
    protected _editingObject: object = {
        selected: [true]
    };
}
