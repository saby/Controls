import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {TimeInterval} from 'Types/entity';
import {ICallback, InputCallback as IC} from 'Controls/input';
import controlTemplate = require('wml!Controls-demo/Input/InputCallback/InputCallback');
import 'css!Controls-demo/Controls-demo';

const MAX_LENGTH = 5;

class InputCallback extends Control<IControlOptions> {
    protected _maxLength: number = MAX_LENGTH;
    protected _lengthCallback: ICallback<number> = IC.lengthConstraint(MAX_LENGTH);
    protected _hoursFormat: ICallback<TimeInterval> = IC.hoursFormat;
    protected _timeIntervalValue = new TimeInterval();

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}

export default InputCallback;
