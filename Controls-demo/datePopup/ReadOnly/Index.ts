import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/datePopup/ReadOnly/Template');

class Single extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];

    protected _startValue = new Date(2019, 0, 1);
    protected _endValue = new Date(2019, 0, 16);

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Single;
