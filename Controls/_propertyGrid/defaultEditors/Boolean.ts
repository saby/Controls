import {Control} from 'UI/Base';
import template = require('wml!Controls/_propertyGrid/defaultEditors/Boolean');

import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';
import IEditor from 'Controls/_propertyGrid/IEditor';
import 'Controls/toggle';

/**
 * Редактор для логического типа данных.
 * 
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_propertyGrid.less переменные тем оформления}
 * 
 * @class Controls/_propertyGrid/defaultEditors/Boolean
 * @extends UI/Base:Control
 * @mixes Controls/propertyGrid:IEditor
 * 
 * @public
 * @author Герасимов А.М.
 */

/*
 * Editor for boolean type.
 * @class Controls/_propertyGrid/defaultEditors/Boolean
 * @extends UI/Base:Control
 * @mixes Controls/propertyGrid:IEditor
 * 
 * @public
 * @author Герасимов А.М.
 */

// @ts-ignore
class BooleanEditor extends Control implements IEditor {
    protected _template: Function = template;
    protected _options: IEditorOptions;

    protected value: boolean;

    _beforeMount(options: IEditorOptions): void {
        this.value = options.propertyValue;
    }

    _beforeUpdate(newOptions: IEditorOptions): void {
        if (this._options.propertyValue !== newOptions.propertyValue) {
            this.value = newOptions.propertyValue;
        }
    }

    _valueChanged(event: Event, value: boolean): void {
        this.value = value;
        this._notify('propertyValueChanged', [value], {bubbling: true});
    }
}

export = BooleanEditor;
