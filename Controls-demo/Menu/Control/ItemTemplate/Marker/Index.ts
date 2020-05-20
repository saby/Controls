import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/ItemTemplate/Marker/Index');
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            data: [
                {key: '1', title: 'Yaroslavl'},
                {key: '2', title: 'Moscow'},
                {key: '3', title: 'St-Petersburg'}
            ],
            keyProperty: 'key'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Menu/Menu'];
}
