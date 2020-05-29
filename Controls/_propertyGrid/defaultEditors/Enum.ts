import Control = require('Core/Control');
import template = require('wml!Controls/_propertyGrid/defaultEditors/Enum');

import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';
import IEditor from 'Controls/_propertyGrid/IEditor';

/**
 * Редактор для перечисляемого типа данных.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_propertyGrid.less">переменные тем оформления</a>
 * 
 * @class Controls/_propertyGrid/defaultEditors/Enum
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IEditor
 * @control
 * @public
 * @author Герасимов А.М.
 */

/*
 * Editor for enum type.
 * @class Controls/_propertyGrid/defaultEditors/Enum
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IEditor
 * @control
 * @public
 * @author Герасимов А.М.
 */

// @ts-ignore
class EnumEditor extends Control implements IEditor {
    protected _template: Function = template;
    protected _options: IEditorOptions;

    protected selectedKey: string = '';

    _beforeMount(options: IEditorOptions): void {
        this._enum = options.propertyValue;
        this.selectedKey = options.propertyValue.getAsValue();
    }

    _selectedKeyChanged(event: Event, value: string): void {
        this.selectedKey = value;
        this._enum.setByValue(value);
        this._notify('propertyValueChanged', [this._enum], {bubbling: true});
    }
}

export = EnumEditor;
