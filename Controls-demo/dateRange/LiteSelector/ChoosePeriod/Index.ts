import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/dateRange/LiteSelector/ChoosePeriod/Template");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _startValue1: Date = new Date(2020, 0);
    protected _endValue1: Date = new Date(2021, 0, 0);
    protected _startValue2: Date = new Date(2020, 0);
    protected _endValue2: Date = new Date(2021, 0, 0);
    protected _startValue3: Date = new Date(2020, 0);
    protected _endValue3: Date = new Date(2021, 0, 0);
    protected _startValue4: Date = new Date(2020, 0);
    protected _endValue4: Date = new Date(2021, 0, 0);
    protected _startValue5: Date = new Date(2020, 0);
    protected _endValue5: Date = new Date(2021, 0, 0);

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/dateRange/LiteSelector/ChoosePeriod/Style'
    ];
}

export default DemoControl;
