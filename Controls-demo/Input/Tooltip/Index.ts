import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Tooltip/Tooltip');

class Tooltip extends Control<IControlOptions> {
    protected _short = 'short';
    protected _long = 'long long long long long long long long long long long long';
    protected _placeholder = 'Tooltip';

    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    static _theme: string[] = ['Controls/Classes'];
}

export default Tooltip;
