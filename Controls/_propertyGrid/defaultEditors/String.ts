import {Control} from 'UI/Base';
import template = require('wml!Controls/_propertyGrid/defaultEditors/String');

import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';
import IEditor from 'Controls/_propertyGrid/IEditor';

/**
 * Редактор для строкового типа данных.
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_propertyGrid.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 * @implements Controls/propertyGrid:IEditor
 *
 * @public
 * @author Герасимов А.М.
 */

/*
 * Editor for string type.
 * @extends UI/Base:Control
 * @implements Controls/propertyGrid:IEditor
 *
 * @public
 * @author Герасимов А.М.
 */

// @ts-ignore
class StringEditor extends Control implements IEditor {
    protected _template: Function = template;
    protected _options: IEditorOptions;

    protected value: string = '';
    private initialValue: string = '';

    _beforeMount(options: IEditorOptions): void {
        this.value = options.propertyValue;
        this.initialValue = options.propertyValue;
    }

    _beforeUpdate(newOptions: IEditorOptions): void {
        if (this._options.propertyValue !== newOptions.propertyValue) {
            this.value = newOptions.propertyValue;
            this.initialValue = newOptions.propertyValue;
        }
    }

    _inputCompleted(event: Event, value: string): void {
        if (this.initialValue !== value) {
            this.initialValue = value;
            this._notify('propertyValueChanged', [value], {bubbling: true});
        }
    }

    static getDefaultOptions(): Partial<IEditorOptions> {
        return {
            propertyValue: ''
        };
    }
}

Object.defineProperty(StringEditor, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return StringEditor.getDefaultOptions();
    }
});

export = StringEditor;
