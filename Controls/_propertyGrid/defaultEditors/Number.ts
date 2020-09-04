import Control = require('Core/Control');
import template = require('wml!Controls/_propertyGrid/defaultEditors/Number');

import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';
import IEditor from 'Controls/_propertyGrid/IEditor';

interface INumberEditorOptions extends IEditorOptions {
    inputConfig: {
        useGrouping: boolean;
        showEmptyDecimals: boolean;
        integersLength: number;
        precision: number;
        onlyPositive: boolean;
    };
}

/**
 * Редактор для перечисляемого типа данных.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_propertyGrid.less">переменные тем оформления</a>
 *
 * @class Controls/_propertyGrid/defaultEditors/Number
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IEditor
 * @control
 * @public
 * @author Борисов А.Н.
 */

/*
 * Editor for the number type.
 * @class Controls/_propertyGrid/defaultEditors/Number
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IEditor
 * @control
 * @public
 * @author Борисов А.Н.
 */

class NumberEditor extends Control implements IEditor {
    protected _template: Function = template;
    protected _options: IEditorOptions;

    protected _value: number = null;
    private _initialValue: number = null;

    _beforeMount(options: IEditorOptions): void {
        this._initialValue = this._value = options.propertyValue;
    }

    _beforeUpdate(newOptions: IEditorOptions): void {
        if (this._options.propertyValue !== newOptions.propertyValue) {
            this._value = newOptions.propertyValue;
            this._initialValue = newOptions.propertyValue;
        }
    }

    _inputCompleted(event: Event, value: number): void {
        const newValue = value || 0;
        if (this._initialValue !== newValue) {
            this._initialValue = newValue;
            this._notify('propertyValueChanged', [newValue], {bubbling: true});
        }
    }
}

export = NumberEditor;
