import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// @ts-ignore
import {date as formatDate} from 'Types/formatter';
import controlTemplate = require('wml!Controls-demo/Calendar/MonthList/Default/Default');

class DefaultDemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _position: Date;

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default DefaultDemoControl;
