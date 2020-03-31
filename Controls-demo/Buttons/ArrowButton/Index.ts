import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Buttons/ArrowButton/Index');
import 'css!Controls-demo/Controls-demo';

class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];

    private _startValue: Date = new Date(2019, 0);
    private _endValue: Date = new Date(2019, 1, 0);

    private _shiftBack = (): void => {
        this._children.selector.shiftBack();
    }

    private _shiftForward = (): void => {
        this._children.selector.shiftForward();
    }
}
export default Demo;
