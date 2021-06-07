import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Toolbar/ItemsSpacing/Template');
import {Memory} from 'Types/source';
import {data} from '../resources/toolbarItems';

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _toolbarSource: Memory;

    protected _beforeMount(): void {
        this._toolbarSource = new Memory({
            keyProperty: 'id',
            data: data.getDefaultItemsWithoutToolButton()
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
