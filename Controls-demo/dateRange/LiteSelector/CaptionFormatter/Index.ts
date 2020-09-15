import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/dateRange/LiteSelector/CaptionFormatter/CaptionFormatter");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    _captionFormatter(startValue, endValue, emptyCaption): string {
        return startValue ? startValue.getMonth() + ' месяц' : emptyCaption;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
