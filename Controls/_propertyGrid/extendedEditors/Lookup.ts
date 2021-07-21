import {Control, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import LookupTemplate = require('wml!Controls/_propertyGrid/extendedEditors/Lookup');
import IEditor from 'Controls/_propertyGrid/IEditor';
import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';

interface ILookupEditorOptions extends IEditorOptions {
    propertyValue: number[]|string[];
}

/**
 * Редактор для поля выбора из справочника.
 * @extends UI/Base:Control
 * @implements Controls/propertyGrid:IEditor
 * @author Мельникова Е.А.
 * @public
 */

class LookupEditor extends Control implements IEditor {
    protected _template: TemplateFunction = LookupTemplate;
    protected _selectedKeys: string[]|number[] = null;

    protected _beforeMount(options?: ILookupEditorOptions): void {
        this._selectedKeys = options.propertyValue;
    }

    protected _beforeUpdate(options?: ILookupEditorOptions): void {
        if (this._options.propertyValue !== options.propertyValue) {
            this._selectedKeys = options.propertyValue;
        }
    }

    protected _handleSelectedKeysChanged(event: SyntheticEvent, value: number): void {
        this._notify('propertyValueChanged', [value], {bubbling: true});
    }

    static getDefaultOptions(): object {
        return {
            propertyValue: []
        };
    }
}

Object.defineProperty(LookupEditor, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return LookupEditor.getDefaultOptions();
   }
});

export default LookupEditor;
