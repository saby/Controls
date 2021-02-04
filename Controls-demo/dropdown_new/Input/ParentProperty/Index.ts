import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Input/ParentProperty/Index');
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKeys: number[] = [1];

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                { key: 1, title: 'Task in development', parent: null, '@parent': false },
                { key: 2, title: 'Error in development', parent: null, '@parent': false },
                { key: 3, title: 'Application', parent: null, '@parent': false },
                { key: 4, title: 'Assignment', parent: null, '@parent': true },
                { key: 5, title: 'Approval', parent: null, '@parent': false },
                { key: 6, title: 'Working out', parent: null, '@parent': false },
                { key: 7, title: 'Assignment for accounting', parent: 4, '@parent': false },
                { key: 8, title: 'Assignment for delivery', parent: 4, '@parent': false },
                { key: 9, title: 'Assignment for logisticians', parent: 4, '@parent': false }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
