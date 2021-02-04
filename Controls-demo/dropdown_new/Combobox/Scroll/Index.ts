import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/dropdown_new/Combobox/Scroll/Index';
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKey: string = '1';

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                { key: '1', title: 'Yaroslavl' },
                { key: '2', title: 'Moscow' },
                { key: '3', title: 'St-Petersburg' },
                { key: '4', title: 'Astrahan' },
                { key: '5', title: 'Arhangelsk' },
                { key: '6', title: 'Abakan' },
                { key: '7', title: 'Barnaul' },
                { key: '8', title: 'Belgorod' },
                { key: '9', title: 'Voronezh' },
                { key: '10', title: 'Vladimir' },
                { key: '11', title: 'Bryansk' },
                { key: '12', title: 'Ekaterinburg'},
                { key: '13', title: 'Kostroma' },
                { key: '14', title: 'Vologda' },
                { key: '15', title: 'Pskov' },
                { key: '16', title: 'Kirov' }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dropdown_new/Combobox/Index'];
}
