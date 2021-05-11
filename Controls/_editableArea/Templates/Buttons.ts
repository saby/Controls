import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ButtonsTemplate = require('wml!Controls/_editableArea/Templates/Buttons');
import {EventUtils} from 'UI/Events';
import 'css!Controls/editableArea';

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
}
/**
 * @event Происходит при клике на кнопку сохранения редактирования.
 * @name Controls/_editableArea/Templates/Buttons#applyButtonClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 */

/**
 * @event Происходит при клике на кнопку отмены редактирования.
 * @name Controls/_editableArea/Templates/Buttons#closeButtonClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 */
export default Buttons;
