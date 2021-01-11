import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/dateRange/LiteSelector/CaptionFormatter/CaptionFormatter");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _startValue: Date = new Date(2020, 0);
    protected _endValue: Date = new Date(2021, 0, 0);

    _captionFormatter(startValue, endValue, emptyCaption): string {
        return startValue ? startValue.getMonth() + ' месяц' : emptyCaption;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
