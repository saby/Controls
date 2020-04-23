import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/FilterView/ItemTemplates/ItemTemplates');
import {Memory} from 'Types/source';

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _source: object[] = [
        {
            name: 'date',
            resetValue: [new Date(2019, 7, 1), new Date(2019, 7, 31)],
            value: [new Date(2019, 6, 1), new Date(2019, 6, 31)],
            type: 'dateRange',
            editorOptions: {
                chooseHalfyears: false,
                chooseYears: false
            },
            viewMode: 'basic'
        },
        {
            name: 'document',
            value: null,
            resetValue: null,
            textValue: '',
            emptyText: 'All documents',
            editorOptions: {
                source: new Memory({
                    keyProperty: 'id',
                    data: [
                        {id: 1, title: 'My'},
                        {id: 2, title: 'My department'}
                    ]
                }),
                displayProperty: 'title',
                keyProperty: 'id'
            },
            viewMode: 'frequent'
        },
        {
            name: 'category',
            value: [1],
            resetValue: [null],
            textValue: '',
            emptyText: 'all categories',
            editorOptions: {
                source: new Memory({
                    keyProperty: 'id',
                    data: [{ id: 1, title: 'Banking and financial services, credit' },
                        { id: 2, title: 'Gasoline, diesel fuel, light oil products' },
                        { id: 3, title: 'Transportation, logistics, customs' }]
                }),
                displayProperty: 'title',
                keyProperty: 'id',
                multiSelect: true
            },
            viewMode: 'frequent'
        },
        {name: 'author', value: 'Ivanov K.K.', textValue: 'Author: Ivanov K.K.', resetValue: '', viewMode: 'basic'}
    ];

    static _theme: string[] = ['Controls/Classes'];
}
export default ViewModes;