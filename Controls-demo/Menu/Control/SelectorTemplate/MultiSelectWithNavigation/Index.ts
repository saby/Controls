import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/SelectorTemplate/MultiSelectWithNavigation/Index');
import {Memory} from 'Types/source';
import {factory} from 'Types/chain';

class SelectorTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Menu/Menu'];
    protected _source: Memory;
    protected _items: object[];
    protected _navigation: object;
    protected _selectedKeysMultiSelect: number[];
    protected _selectedKeys: number[];

    protected _beforeMount(): void {
        this._navigation = {
            view: 'page',
            source: 'page',
            sourceConfig: {
                pageSize: 4,
                page: 0,
                hasMore: false
            }
        };

        this._items = [
            { key: 1, title: 'Banking and financial services, credit' },
            { key: 2, title: 'Gasoline, diesel fuel, light oil products', comment: 'comment' },
            { key: 3, title: 'Transportation, logistics, customs' },
            { key: 4, title: 'Oil and oil products', comment: 'comment' },
            { key: 5, title: 'Pipeline transportation services', comment: 'comment' },
            { key: 6, title: 'Services in tailoring and repair of clothes, textiles' },
            { key: 7, title: 'Computers and components, computing, office equipment' }
        ];

        this._source = new Memory({
            data: this._items,
            keyProperty: 'key'
        });

        this._selectedKeysMultiSelect = [1, 3];

        this._resultMultiSelect = this._resultMultiSelect.bind(this);
    }

    protected _resultMultiSelect(items): void {
        this._selectedKeysMultiSelect = [];
        factory(items).each((item) => this._selectedKeysMultiSelect.push(item.getId()));
    }
}
export default SelectorTemplate;