import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_datePopup/Weekday';
import {Utils as calendarUtils} from 'Controls/dateRange';

export default class Weekday extends Control {
    protected _template: TemplateFunction = template;
    protected _weekday: string;

    protected _beforeMount(options: IControlOptions): void {
        this._setWeekday(options.value);
    }

    protected _beforeUpdate(options: IControlOptions): void {
        if (this._options.value !== options.value) {
            this._setWeekday(options.value);
        }
    }

    private _setWeekday(value: Date): string {
        if (value) {
            const weekdaysCaption = calendarUtils.getWeekdaysCaptions();
            let dayIndex = value.getDay();
            if (dayIndex === 0) {
                // Воскресение считается как нулевой день.
                dayIndex = 7;
            }
            this._weekday = weekdaysCaption[dayIndex - 1]?.caption;
        } else {
            this._weekday = '';
        }
    }

    static _theme: string[] = ['Controls/datePopup'];
}
