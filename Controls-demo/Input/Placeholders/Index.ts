import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Placeholders/Placeholders');

class Placeholders extends Control<IControlOptions> {
    protected _value: string = '';

    protected _template: TemplateFunction = controlTemplate;

    protected _generatePassword() {
        this._value = Math.random().toString(36).slice(2);
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Input/Placeholders/Placeholders'];
}

export default Placeholders;
