import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Calendar/MonthSlider/DisplayedRanges/DisplayedRanges';

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _month: Date = new Date(2017, 0, 1);
    protected _displayedRanges: [Date[]] = [[new Date(2015, 0), new Date(2018, 5)]];
}

export default DemoControl;
