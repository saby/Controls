import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/Editors/CheckboxGroup/Index';
import {Memory} from 'Types/source';

export default class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _source: object[] = [
        {
            name: 'selected',
            caption: 'CheckboxGroup',
            editorTemplateName: 'Controls/propertyGrid:CheckboxGroupEditor',
            editorOptions: {
                source: new Memory({
                    keyProperty: 'key',
                    data: [
                        {
                            key: 1,
                            title: 'First option'
                        },
                        {
                            key: 2,
                            title: 'Second option'
                        },
                        {
                            key: 3,
                            title: 'Third option'
                        }
                    ]
                }),
                keyProperty: 'key'
            }
        }
    ];
    protected _editingObject: object = {
        selected: [1]
    };
}
