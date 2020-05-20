import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/EmptyText/EmptyKey/Index');
import {Memory} from 'Types/source';

class EmptyKey extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {

        this._source = new Memory({
            data: [
                { key: 1, title: 'Sales of goods and services' },
                { key: 2, title: 'Contract' },
                { key: 3, title: 'Texture' }
            ],
            keyProperty: 'key'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Menu/Menu'];
}

export default EmptyKey;
