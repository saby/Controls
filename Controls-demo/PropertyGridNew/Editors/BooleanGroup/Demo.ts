import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/Editors/BooleanGroup/Demo';

export default class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _source: object[] = [
        {
            name: 'decoration',
            caption: 'BooleanGroup',
            editorTemplateName: 'Controls/propertyGrid:BooleanGroupEditor',
            editorOptions: {
                buttons: [{
                    id: 0,
                    tooltip: 'Полужирный',
                    icon: 'icon-Bold'
                }, {
                    id: 1,
                    tooltip: 'Курсив',
                    icon: 'icon-Italic'
                }, {
                    id: 2,
                    tooltip: 'Подчеркнутый',
                    icon: 'icon-Underline'
                }, {
                    id: 3,
                    tooltip: 'Зачёркнутый',
                    icon: 'icon-Stroked'
                }]
            }
        }
    ];
    protected _editingObject: object = {
        decoration: [true, true, false, true]
    };
}
