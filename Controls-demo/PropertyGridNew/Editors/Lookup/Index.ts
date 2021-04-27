import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/Editors/Lookup/Index';
import {Memory} from 'Types/source';

export default class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _source: object[] = [
        {
            name: 'selected',
            caption: 'Lookup',
            editorTemplateName: 'Controls/propertyGrid:LookupEditor',
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
                keyProperty: 'key',
                displayProperty: 'title',
                searchParam: 'title',
                selectorTemplate: {
                    templateName: 'Controls-demo/PropertyGridNew/Editors/Lookup/resources/SelectorTemplate',
                    templateOptions: {
                        headingCaption: 'Выберите'
                    },
                    popupOptions: {
                        width: 500
                    }
                }
            }
        }
    ];
    protected _editingObject: object = {
    };
}
