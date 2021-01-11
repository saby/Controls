import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/JumpingLabel/Required/Required');

import 'Controls/input';

class Standard extends Control<IControlOptions> {

    protected _template: TemplateFunction = controlTemplate;
    private _name: string = 'Alex';

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Standard;
