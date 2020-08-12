import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';
import {IPropertyGridButton} from './BooleanGroup';
import IEditor from 'Controls/_propertyGrid/IEditor';
import * as template from 'wml!Controls/_propertyGrid/extendedEditors/FlatEnum';
import {RecordSet, Enum} from 'Types/collection';
import {Control, TemplateFunction} from 'UI/Base';

interface IOptions extends IEditorOptions {
    buttons: IPropertyGridButton[];
}

export default class FlatEnumEditor extends Control implements IEditor {
    protected _template: TemplateFunction = template;
    protected _options: IEditorOptions;

    protected _buttons: RecordSet;
    protected _enum: Enum<unknown>;
    protected selectedKey: string = '';

    _beforeMount(options: IOptions): void {
        this._enum = options.propertyValue;

        options.buttons[options.buttons.length - 1].isLast = true;
        this._buttons = new RecordSet({
            keyProperty: 'id',
            rawData: options.buttons
        });
        this.selectedKey = options.propertyValue.getAsValue();
    }

    _beforeUpdate(options: IOptions): void {
        this.selectedKey = options.propertyValue.getAsValue();
    }

    _selectedKeyChanged(event: Event, value: string): void {
        this.selectedKey = value;
        this._enum.setByValue(value);
        this._notify('propertyValueChanged', [this._enum], {bubbling: true});
    }
}
