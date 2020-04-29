import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// @ts-ignore
import controlTemplate = require('wml!Controls-demo/dateRange/Input/Validators/Validators');

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _startValue1: Date;
    protected _endValue1: Date;
    protected _startValue2: Date;
    protected _endValue2: Date;
    protected _startValue3: Date;
    protected _endValue3: Date;

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default DemoControl;
