import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/resources/Editors/Text';
import {SyntheticEvent} from 'Vdom/Vdom';

export default class extends Control {
    _template: TemplateFunction = Template;

    protected _valueChangedHandler(event: SyntheticEvent<Event>, value: string): void {
        this._notify('valueChanged', [value]);
        this._notify('textValueChanged', [value]);
    }
}
