import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Tooltip/Tooltip');
import 'css!Controls-demo/Controls-demo';

class Tooltip extends Control<IControlOptions> {
    protected _short = 'short';
    protected _long = 'long long long long long long long long long long long long';
    protected _placeholder = 'Tooltip';

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}

export default Tooltip;
