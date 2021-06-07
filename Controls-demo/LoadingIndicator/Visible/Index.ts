import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/LoadingIndicator/Visible/Template');

class Visible extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _theme: string[] = ['Controls/Classes'];
    protected _visible: boolean = true;
    protected _handleClick(){
        this._visible = !this._visible;
    }
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/LoadingIndicator/IndicatorContainer'];
}
export default Visible;