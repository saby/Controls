import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {date} from 'Types/formatter';
import controlTemplate = require('wml!Controls-demo/Decorator/Date/Date');

class DateDecorator extends Control<IControlOptions> {
    protected _value = new Date('December 17, 2021 10:00:00');
    protected _format = date.FULL_DATETIME;

    protected _template: TemplateFunction = controlTemplate;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DateDecorator;
