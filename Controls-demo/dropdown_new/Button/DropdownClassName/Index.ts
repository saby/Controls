import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Button/DropdownClassName/Index');
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                { key: '1', title: 'Banking and financial services, credit' },
                { key: '2', title: 'Gasoline, diesel fuel, light oil products' },
                { key: '3', title: 'Transportation, logistics, customs' },
                { key: '4', title: 'Oil and oil products' },
                { key: '5', title: 'Pipeline transportation services' },
                { key: '6', title: 'Services in tailoring and repair of clothes, textiles' },
                { key: '7', title: 'Computers and components, computing, office equipment' }
            ]
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo',
        'Controls-demo/dropdown_new/Button/DropdownClassName/Index'];
}
