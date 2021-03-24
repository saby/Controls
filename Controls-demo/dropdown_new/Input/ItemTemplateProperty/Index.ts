import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Input/ItemTemplateProperty/Index');
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKeys: number[] = [1];

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                { key: 1, text: 'In any state' },
                { key: 2, text: 'In progress' },
                { key: 3, text: 'Completed' },
                {
                    key: 4,
                    title: 'positive',
                    text: 'Completed positive',
                    myTemplate: 'wml!Controls-demo/dropdown_new/Input/ItemTemplateProperty/itemTemplate'
                },
                {
                    key: 5,
                    title: 'negative',
                    text: 'Completed negative',
                    myTemplate: 'wml!Controls-demo/dropdown_new/Input/ItemTemplateProperty/itemTemplate'
                },
                { key: 6, text: 'Deleted' },
                { key: 7, text: 'Drafts' }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dropdown_new/Input/Index'];
}
