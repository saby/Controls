import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/Editors/Dropdown/Index';
import * as SearchMemory from 'Controls-demo/Search/SearchMemory';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';

export default class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _source: object[] = [
        {
            name: 'selected',
            caption: 'CheckboxGroup',
            editorTemplateName: 'Controls/propertyGrid:DropdownEditor',
            editorOptions: {
                source: new SearchMemory({
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
                    ],
                    searchParam: 'title',
                    filter: MemorySourceFilter()
                }),
                keyProperty: 'key',
                displayProperty: 'title',
                searchParam: 'title'
            }
        }
    ];
    protected _editingObject: object = {
        selected: [1]
    };
}
