import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import Template = require('wml!Controls-demo/toggle/RadioGroup/displayProperty/Template');

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _selectedKey1: string = '1';
    protected _selectedKey2: string = '1';
    protected _source: Memory;
    protected _displayProperty: string = 'caption';

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: [{
                id: '1',
                title: 'title 1',
                caption: 'caption 1'
            }, {
                id: '2',
                title: 'title 2',
                caption: 'caption 2'
            }, {
                id: '3',
                title: 'title 3',
                caption: 'caption 3'
            }]
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
