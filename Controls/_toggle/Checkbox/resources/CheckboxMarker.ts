import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls/_toggle/Checkbox/resources/CheckboxMarker');

export interface ICheckboxMarkerOptions extends IControlOptions {
    triState?: boolean;
    value?: boolean | null;
}
/**
 * Контрол, отображающий элемент контрола "чекбокс" - галочку
 * @remark
 * Контрол служит только для отображения галочки, он не реагирует на какие-либо события и сам не стреляет событиями
 * @class Controls/_toggle/CheckboxMarker
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 * @category Toggle
 * @demo Controls-demo/Checkbox/Checkbox
 */
/**
 * @name Controls/_toggle/Checkbox#triState
 * @cfg {Boolean} Определяет, разрешено ли устанавливать чекбоксу третье состояние — "не определен" (null).
 * @default False
 * @remark
 * True - Разрешено устанавливать третье состояние.
 * False - Не разрешено устанавливать третье состояние.
 * Если установлен режим triState, то значение может быть "null".
 */
/**
 * @name Controls/_toggle/Checkbox#value
 * @cfg {Boolean|null} Значение, которое определяет текущее состояние.
 * @default False
 * @remark
 * True - Чекбокс в состоянии "отмечено".
 * False - Чекбокс в состоянии "не отмечено". Это состояние по умолчанию.
 * Null - Состояние чекбокса при включенной опции TriState.
 * Вариант "null" возможен только при включенной опции triState.
 */
class CheckboxMarker extends Control<ICheckboxMarkerOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/toggle'];
}
export default CheckboxMarker;
