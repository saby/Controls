import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ButtonsTemplate = require('wml!Controls/_editableArea/Templates/Buttons');
import {EventUtils} from 'UI/Events';

/**
 * Кнопки для сохранения и отмены редактирования.
 * @class Controls/_editableArea/Templates/Buttons
 * @extends UI/Base:Control
 * @public
 * @author Колесова П.С.
 * @demo Controls-demo/EditableArea/Buttons/Index
 */

class Buttons extends Control<IControlOptions> {
    protected _template: TemplateFunction = ButtonsTemplate;
    protected _tmplNotify: Function = EventUtils.tmplNotify;
    static _theme: string[] = ['Controls/editableArea'];
}
/**
 * @event Происходит при клике на кнопку сохранения редактирования.
 * @name Controls/_editableArea/Templates/Buttons#applyButtonClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */

/**
 * @event Происходит при клике на кнопку отмены редактирования.
 * @name Controls/_editableArea/Templates/Buttons#closeButtonClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */
export default Buttons;
