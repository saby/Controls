import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/SpellCheck/SpellCheck');

class SpellCheck extends Control<IControlOptions> {
    protected _value = 'Сдравстуйте май друх!!!';

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default SpellCheck;
