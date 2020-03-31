import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Calendar/MonthView/DayHeaderTemplate/DayHeaderTemplate');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Calendar/MonthView/DayHeaderTemplate/DayHeaderTemplate';

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    private _month: Date = new Date(2019, 1);

    static _theme: string[] = ['Controls/Classes'];
}

export default Index;
