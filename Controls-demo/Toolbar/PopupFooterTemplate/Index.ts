import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Toolbar/PopupFooterTemplate/Template');
import {Memory} from 'Types/source';
import {data} from '../resources/toolbarItems';

class FooterTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _toolbarSource: Memory;

    protected _beforeMount(): void {
        this._toolbarSource = new Memory({
            keyProperty: 'id',
            data: data.getDefaultItems()
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default FooterTemplate;
