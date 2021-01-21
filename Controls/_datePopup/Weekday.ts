import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_datePopup/Weekday';
import {Utils as calendarUtils} from 'Controls/dateRange';

export default class Weekday extends Control {
    protected _template: TemplateFunction = template;
    protected _weekday: number;

    protected _beforeMount(options: IControlOptions): void {
        this._setWeekday(options.value);
    }

    protected _beforeUpdate(options: IControlOptions): void {
        if (this._options.value !== options.value) {
            this._setWeekday(options.value);
        }
    }

    private _setWeekday(value: Date): string {
        const weekdaysCaption = calendarUtils.getWeekdaysCaptions();
        this._weekday = weekdaysCaption[value.getDay() - 1]?.caption;
    }

    static _theme: string[] = ['Controls/datePopup'];
}
