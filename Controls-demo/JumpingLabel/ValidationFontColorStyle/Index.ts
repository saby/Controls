import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/JumpingLabel/ValidationFontColorStyle/ValidationFontColorStyle');

import 'Controls/input';
import 'Controls/validate';

class ValidationFontColorStyle extends Control<IControlOptions> {
    private _valueIsEmail1: string = 'demo';
    private _valueIsEmail2: string = 'demo';

    protected _template: TemplateFunction = controlTemplate;

    protected _afterMount(options?: IControlOptions, contexts?: any): void {
        this._children.inputContainer1.validate();
        this._children.inputContainer2.validate();
        super._afterMount(options, contexts);
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default ValidationFontColorStyle;
