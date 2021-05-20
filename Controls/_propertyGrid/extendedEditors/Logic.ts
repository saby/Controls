import {Control, TemplateFunction} from 'UI/Base';
import { SyntheticEvent } from 'UICommon/Events';
import template = require('wml!Controls/_propertyGrid/extendedEditors/Logic');
import IEditor from 'Controls/_propertyGrid/IEditor';
import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';

interface ILogicEditorOptions extends IEditorOptions{
    editorMode: string;
    propertyValue: boolean[];
}

/**
 * Редактор логическое поле. Отображается в виде выпадающего списка с тремя значениями:
 * • Да
 * • Нет
 * • Не выбрано
 * @class Controls/_propertyGrid/extendedEditors/Logic
 * @extends UI/Base:Control
 * @author Золотова Э.Е.
 * @public
 */

export default class extends Control<ILogicEditorOptions> implements IEditor {
    protected _template: TemplateFunction = template;
    protected _selectedKeys: boolean[] = [null];

    protected _beforeMount(options?: ILogicEditorOptions): void {
        this._selectedKeys = options.propertyValue;
    }

    protected _beforeUpdate(options?: ILogicEditorOptions): void {
        if (this._options.propertyValue !== options.propertyValue) {
            this._selectedKeys = options.propertyValue;
        }
    }

    protected _handleSelectedKeysChanged(event: SyntheticEvent, value: boolean): void {
        this._notify('propertyValueChanged', [value], {bubbling: true});
    }
}
