import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Input/ItemTemplate/AdditionalTextTemplate/MultiSelect/Index');
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKeys: number[] = [1];

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                { key: 1, title: 'Banking and financial services, credit' },
                { key: 2, title: 'Gasoline, diesel fuel, light oil products', comment: 'comment' },
                { key: 3, title: 'Transportation, logistics, customs' },
                { key: 4, title: 'Oil and oil products', comment: 'comment' },
                { key: 5, title: 'Pipeline transportation services', comment: 'comment' },
                { key: 6, title: 'Services in tailoring and repair of clothes, textiles' },
                { key: 7, title: 'Computers and components, computing, office equipment' }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
