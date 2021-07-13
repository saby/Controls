import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Test/Template');
import {SyntheticEvent} from 'Vdom/Vdom';

class DemoTest extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _startDate: Date = new Date(2017, 0, 1, 12, 15, 30, 123);
    protected _endDate: Date = new Date(2017, 0, 2, 12, 15, 30, 123);
    protected _endTime: Date;
    protected _value: string;
    protected _value1: string;
    protected _value2: number;
    protected _value3: number = 0;
    protected _value4: number = 10;
    protected _value5: string = '';
    protected _value6: string = '';
    protected _mask: string = 'DD.MM.YYYY';

    protected _moneyHandler(e: SyntheticEvent, newValue: number): void {
        if (String(newValue).length > 7) {
            this._value2 = 0;
        }
    }

    protected _dataTimeHandler(): void {
        this._endTime = new Date(0, 0, 0, 12, 55, 0, 0);
    }

    protected _startHandler(e: SyntheticEvent, newValue: number): void {
        this._value5 = String(newValue);
    }

    protected _endHandler(e: SyntheticEvent, newValue: number): void {
        this._value6 = String(newValue);
    }

    protected _inputHandler(e: SyntheticEvent, newValue: number): void {
        this._value3 = Number(newValue);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default DemoTest;
