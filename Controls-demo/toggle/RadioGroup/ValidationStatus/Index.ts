import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from "Types/source";
import Template = require('wml!Controls-demo/toggle/RadioGroup/ValidationStatus/Template');

class ValidationStatus extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _selectedKey: string = '1';
    protected _selectedKey2: string = '1';
    protected _selectedKey3: string = '';
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            displayProperty: 'caption',
            data: [{
                id: '1',
                title: 'State1'
            }, {
                id: '2',
                title: 'State2'
            }, {
                id: '3',
                title: 'State3'
            }]
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ValidationStatus;
