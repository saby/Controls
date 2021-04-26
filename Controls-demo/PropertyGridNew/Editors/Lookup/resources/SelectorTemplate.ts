import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/PropertyGridNew/Editors/Lookup/resources/SelectorTemplate');
import {Memory} from 'Types/source';

export default class SelectorTemplate extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory = null;
    protected _keyProperty: string = 'id';
    protected _selectionChanged: boolean = false;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: [
                {
                    key: 1,
                    title: 'First option'
                },
                {
                    key: 2,
                    title: 'Second option'
                },
                {
                    key: 3,
                    title: 'Third option'
                }
            ]
        });
    }
}
