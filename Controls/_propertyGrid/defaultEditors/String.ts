import Control = require('Core/Control');
import template = require('wml!Controls/_propertyGrid/defaultEditors/String');

import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';
import IEditor from 'Controls/_propertyGrid/IEditor';

/**
 * Редактор для строкового типа данных.
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_propertyGrid.less">переменные тем оформления</a>
 * 
 * @class Controls/_propertyGrid/defaultEditors/String
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IEditor
 * @control
 * @public
 * @author Герасимов А.М.
 */

/*
 * Editor for string type.
 * @class Controls/_propertyGrid/defaultEditors/String
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IEditor
 * @control
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
}

export = StringEditor;
