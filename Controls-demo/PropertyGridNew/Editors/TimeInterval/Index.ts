import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/Editors/TimeInterval/Index';
import {TimeInterval} from 'Types/entity';

export default class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _source: object[] = [
        {
            name: 'time',
            caption: 'TimeInterval',
            editorTemplateName: 'Controls/propertyGrid:TimeIntervalEditor',
            editorOptions: {
                mask: 'HH:MM'
            }
        }
    ];
    protected _editingObject: object = {
        time: new TimeInterval()
    };
}
