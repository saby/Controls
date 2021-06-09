import {TemplateFunction} from 'UI/Base';

export interface IFieldTemplateOptions {
    leftFieldTemplate?: TemplateFunction;
    rightFieldTemplate?: TemplateFunction;
}

/**
 * @name Controls/_input/interface/IFieldTemplate#leftFieldTemplate
 * @cfg {String|TemplateFunction} Строка или шаблон, содержащие прикладной контент, который будет отображаться слева от текста в поле ввода.
 * @demo Controls-demo/Input/FieldTemplate/Index
 */
/**
 * @name Controls/_input/interface/IFieldTemplate#rightFieldTemplate
 * @cfg {String|TemplateFunction} Строка или шаблон, содержащие прикладной контент, который будет отображаться справа от текста в поле ввода.
 * @demo Controls-demo/Input/FieldTemplate/Index
 */

/**
 * Интерфейс для полей ввода, которые поддерживают шаблоны слева и справа от текста.
 * @public
 * @author Красильников А.С.
 */
export interface IFieldTemplate {
    readonly '[Controls/_input/interface/IFieldTemplate]': boolean;
}
