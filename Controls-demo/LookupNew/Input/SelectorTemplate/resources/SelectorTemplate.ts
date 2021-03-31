import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/LookupNew/Input/SelectorTemplate/resources/SelectorTemplate');
import {Memory} from 'Types/source';
import {COMPANIES} from 'Controls-demo/LookupNew/resources/DataStorage';

export default class SelectorTemplate extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory = null;
    protected _keyProperty: string = 'id';
    protected _selectionChanged: boolean = false;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: COMPANIES
        });
    }
}
