import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/dropdown_new/Combobox/EmptyText/Index';
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                { key: '1', title: 'Banking and financial services, credit' },
                { key: '2', title: 'Gasoline, diesel fuel, light oil products' },
                { key: '3', title: 'Transportation, logistics, customs' },
                { key: '4', title: 'Oil and oil products' }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
