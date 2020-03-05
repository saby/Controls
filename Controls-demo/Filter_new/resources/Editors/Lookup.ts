import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/resources/Editors/Lookup';
import {SyntheticEvent} from 'Vdom/Vdom';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _value: string = '';

    protected _selectedKeysChangedHandler(event: SyntheticEvent<Event>, value: string[]): void {
        this._notify('selectedKeysChanged', [value]);
    }
    protected _textValueChangedHandler(event: SyntheticEvent<Event>, text: string): void {
        this._notify('textValueChanged', [text]);
    }
    protected _itemsChangedHandler(event: SyntheticEvent<Event>, items: RecordSet): void {
        this._notify('itemsChanged', [items]);
    }
}
