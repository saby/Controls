import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {date as formatDate} from 'Types/formatter';
import isInRange from 'Controls-demo/Input/DateBase/Validators/isInRange';
// @ts-ignore
import controlTemplate = require('wml!Controls-demo/Input/DateBase/Validators/Validators');

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected isInRange: Function = isInRange;

    protected _value1: Date;
    protected _value2: Date;
    protected _startValue: Date = new Date(2019, 0, 1);
    protected _endValue: Date = new Date(2020, 0, 1);

    protected _formatDate: Function = formatDate;

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default DemoControl;
