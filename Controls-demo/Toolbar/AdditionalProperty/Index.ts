import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Toolbar/AdditionalProperty/Template');
import {Memory} from 'Types/source';
import {data} from '../resources/toolbarItems';

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _buttonsSource: Memory;
    protected _toolButtonsSource: Memory;
    protected _currentClick: string;

    protected _beforeMount(): void {
        this._buttonsSource = new Memory({
            keyProperty: 'id',
            data: data.getGroupedItems()
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
