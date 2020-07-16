import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/ShortDatePicker/MonthTemplate/IconTemplate/IconTemplate");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    private _state: boolean = true;
    private _periods: [Date[]] = [
        [new Date(2017, 0), new Date(2021, 0)]
    ];

    private _getState = (): boolean => {
        this._state = !this._state;
        return this._state;
    }

    static _theme: string[] = ['Controls/Classes'];
}

export default DemoControl;
