import {Control, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import CheckboxGroupTemplate = require('wml!Controls/_propertyGrid/extendedEditors/Dropdown');
import IEditor from 'Controls/_propertyGrid/IEditor';
import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';

interface IDropdownEditorOptions extends IEditorOptions{
    editorMode: string;
    propertyValue: number[]|string[];
}

/**
 * Редактор для массива в виде выпадающего списка.
 * @class Controls/_propertyGrid/extendedEditors/Dropdown
 * @extends UI/Base:Control
 * @author Мельникова Е.А.
 * @public
 */

class DropdownEditor extends Control implements IEditor {
    protected _template: TemplateFunction = CheckboxGroupTemplate;
    protected _selectedKeys: string[]|number[] = null;

    protected _beforeMount(options?: IDropdownEditorOptions): void {
        this._selectedKeys = options.propertyValue;
    }

    protected _beforeUpdate(options?: IDropdownEditorOptions): void {
        if (this._options.propertyValue !== options.propertyValue) {
            this._selectedKeys = options.propertyValue;
        }
    }

    protected _handleSelectedKeysChanged(event: SyntheticEvent, value: number): void {
        this._notify('propertyValueChanged', [value], {bubbling: true});
    }

    static getDefaultOptions(): object {
        return {
            editorMode: 'Input'
        };
    }
}
export default DropdownEditor;
