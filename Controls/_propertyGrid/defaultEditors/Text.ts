import template = require('wml!Controls/_propertyGrid/defaultEditors/Text');
import StringEditor = require('Controls/_propertyGrid/defaultEditors/String');

/**
 * Редактор для многотрочного типа данных.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_propertyGrid.less">переменные тем оформления</a>
 * 
 * @class Controls/_propertyGrid/defaultEditors/Text
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IEditor
 * @control
 * @public
 * @author Герасимов А.М.
 */

/*
 * Editor for multiline string type.
 * @class Controls/_propertyGrid/defaultEditors/Text
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IEditor
 * @control
 * @public
 * @author Герасимов А.М.
 */

// @ts-ignore
class TextEditor extends StringEditor {
    protected _template: Function = template;
}

export = TextEditor;
