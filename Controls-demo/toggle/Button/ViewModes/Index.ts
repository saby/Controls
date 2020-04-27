import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/Button/ViewModes/ViewModes');

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _button1Value: boolean = false;
    protected _button2Value: boolean = false;
    protected _button3Value: boolean = false;
    protected _button4Value: boolean = false;
    protected _button5Value: boolean = false;

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
