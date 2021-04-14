import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Slider/Base/IntervalTemplate/Template');

interface IPositionedInterval {
    color: string;
    start: number;
    width: number;
}

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _intervals: unknown;
    protected _value: number;

    protected _beforeMount(): void {
        this._value = 500;
        this._intervals = [{
            start: 100,
            end: 101,
            color: 'primary'
        }, {
            start: 510,
            end: 550,
            color: 'danger'
        }];
    }

    protected _getInterval(interval: IPositionedInterval): IPositionedInterval {
        if (interval.width < 5) {
            interval.width = 5;
        }
        return interval;
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
