import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/Source/Index');
import {Memory} from 'Types/source';
import 'css!Controls-demo/Controls-demo';

class Source extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _itemsMore: object[];
    protected _sourceMore: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            data: [
                {key: 1, title: 'Administrator', icon: 'icon-small icon-AdminInfo'},
                {key: 2, title: 'Moderator'},
                {key: 3, title: 'Participant'},
                {key: 4, title: 'Subscriber', icon: 'icon-small icon-Subscribe'}
            ],
            keyProperty: 'key'
        });

        this._itemsMore = [
            {id: 1, title: 'Banking and financial services, credit'},
            {id: 2, title: 'Gasoline, diesel fuel, light oil products', comment: 'comment'},
            {id: 3, title: 'Transportation, logistics, customs'},
            {id: 4, title: 'Oil and oil products', comment: 'comment'},
            {id: 5, title: 'Pipeline transportation services', comment: 'comment'},
            {id: 6, title: 'Services in tailoring and repair of clothes, textiles'},
            {id: 7, title: 'Computers and components, computing, office equipment'}
        ];

        this._sourceMore = new Memory({
            data: this._itemsMore,
            keyProperty: 'id'
        });
    }

    static _theme: string[] = ['Controls/Classes'];

}
export default Source;
