import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Input/ItemTemplate/ContentTemplate/Index');
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKeys: number[] = [1];

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: [
                { id: 1, title: 'Banking and financial services, credit' },
                { id: 2, title: 'Gasoline, diesel fuel, light oil products' },
                { id: 3, title: 'Transportation, logistics, customs' },
                { id: 4, title: 'Oil and oil products' },
                { id: 5, title: 'Pipeline transportation services' },
                { id: 6, title: 'Services in tailoring and repair of clothes, textiles' },
                { id: 7, title: 'Computers and components, computing, office equipment' }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
