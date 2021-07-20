import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_propertyGrid/defaultEditors/Number');

import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';
import IEditor from 'Controls/_propertyGrid/IEditor';

/**
 * Интерфейс опций для числового редактора.
 *
 * @interface Controls/_propertyGrid/defaultEditors/Number/INumberEditorOptions
 * @extends IEditorOptions
 * @public
 * @author Борисов А.Н.
 */

export interface INumberEditorOptions extends IEditorOptions {
    propertyValue: number;
    inputConfig: {
        useGrouping: boolean;
        showEmptyDecimals: boolean;
        integersLength: number;
        precision: number;
        onlyPositive: boolean;
    };
}

/**
 * Редактор численного типа данных.
 *
 * @extends UI/Base:Control
 * @implements Controls/propertyGrid:IEditor
 * @demo Controls-demo/PropertyGridNew/Editors/Number/Demo
 *
 * @public
 * @author Борисов А.Н.
 */

/*
 * Editor for the number type.
 * @extends UI/Base:Control
 * @implements Controls/propertyGrid:IEditor
 *
 * @public
 * @author Борисов А.Н.
 */

export default class NumberEditor extends Control implements IEditor {
    protected _template: TemplateFunction = template;
    protected _options: IEditorOptions;

    protected _value: number = null;
    private _initialValue: number = null;

    _beforeMount(options: INumberEditorOptions): void {
        this._initialValue = this._value = options.propertyValue;
    }

    _beforeUpdate(newOptions: INumberEditorOptions): void {
        if (this._options.propertyValue !== newOptions.propertyValue) {
            this._value = newOptions.propertyValue;
            this._initialValue = newOptions.propertyValue;
        }
    }

    _inputCompleted(event: Event, value: number): void {
        if (this._initialValue !== value) {
            this._initialValue = value;
            this._notify('propertyValueChanged', [value], {bubbling: true});
        }
    }

    static getDefaultOptions(): Partial<INumberEditorOptions> {
        return {
            propertyValue: null
        };
    }
}
/**
 * @name Controls/_propertyGrid/defaultEditors/Number/INumberEditorOptions#inputConfig
 * @cfg Конфигурация числового поля ввода.
 */
