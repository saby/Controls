import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/MaxLength/MaxLength');
import 'css!Controls-demo/Controls-demo';

class MaxLength extends Control<IControlOptions> {
    protected _placeholder = 'Tooltip';

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}

export default MaxLength;
