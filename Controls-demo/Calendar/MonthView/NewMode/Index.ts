import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Calendar/MonthView/NewMode/NewMode');

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    private _month: Date = new Date(2019, 1);

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Calendar/MonthView/NewMode/NewMode'];
}

export default Index;
