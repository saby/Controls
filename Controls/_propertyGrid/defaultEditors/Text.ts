import template = require('wml!Controls/_propertyGrid/defaultEditors/Text');
import StringEditor = require('Controls/_propertyGrid/defaultEditors/String');

/**
 * Редактор для многострочного типа данных.
 * 
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
 * Editor for multiline string type.
 * @extends UI/Base:Control
 * @implements Controls/propertyGrid:IEditor
 * 
 * @public
 * @author Герасимов А.М.
 */

// @ts-ignore
class TextEditor extends StringEditor {
    protected _template: Function = template;
}

export = TextEditor;
