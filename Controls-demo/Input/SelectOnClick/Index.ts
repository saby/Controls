import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/SelectOnClick/SelectOnClick');

import 'css!Controls-demo/Controls-demo';

class SelectOnClick extends Control<IControlOptions> {
    protected _value: string = 'text';
    protected _placeholder = 'Tooltip';

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}

export default SelectOnClick;
