import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/FieldTemplate/FieldTemplate');

class FieldTemplate extends Control<IControlOptions> {
    private _value1: string = '123qweASD';
    private _value2: string = '123qweASD';
    private _value3: string = '123qweASD';
    private _value4: string = '123qweASD';

    protected _template: TemplateFunction = controlTemplate

    private _toLowerCase(event: SyntheticEvent<MouseEvent>, stateName: string): void {
        this[stateName] = this[stateName].toLowerCase();
    }

    private _toUpperCase(event: SyntheticEvent<MouseEvent>, stateName: string): void {
        this[stateName] = this[stateName].toUpperCase();
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Input/FieldTemplate/FieldTemplate'];
}
export default FieldTemplate;
