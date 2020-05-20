import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/MultiSelect/Index');
import {Memory} from 'Types/source';

class MultiSelect extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {

        this._source = new Memory({
            data: [
                { key: 1, title: 'Sales of goods and services' },
                { key: 2, title: 'Contract' },
                { key: 3, title: 'Texture' },
                { key: 4, title: 'Score' },
                { key: 5, title: 'Act of reconciliation' },
                { key: 6, title: 'Goods' },
                { key: 7, title: 'Finished products' }
            ],
            keyProperty: 'key'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Menu/Menu'];
}
export default MultiSelect;
