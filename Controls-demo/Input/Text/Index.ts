import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Text/Text');

import 'Controls-demo/Input/Constraint/Index';
import 'Controls-demo/Input/MaxLength/Index';
import 'Controls-demo/Input/Trim/Index';


class Text extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    static _theme: string[] = ['Controls/Classes'];
}

export default Text;
