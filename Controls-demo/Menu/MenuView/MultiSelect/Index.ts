import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/MenuView/MultiSelect/Index');
import {Memory} from 'Types/source';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Menu/MenuView/Menu';

class SourceDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _ids: string;

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

    private getStringIds(items) {
        let text = '';
        items.forEach( (item) => {
            text += String(item.getContents().getId()) + ' ';
        } );
        return text;
    }

    protected _handler(event ,items) {
        this._ids = this.getStringIds(items);
    }
}
export default SourceDemo;