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
 * @class Controls/_toggle/Checkbox/resources/CheckboxMarker
 * @extends Core/Control
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/toggle/CheckboxMarker/Index
 */

class CheckboxMarker extends Control<ICheckboxMarkerOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/toggle'];
}

/**
 * @name Controls/_toggle/Checkbox/resources/CheckboxMarker#triState
 * @cfg {Boolean} Определяет, разрешено ли устанавливать чекбоксу третье состояние — "не определен" (null).
 * @default False
 * @remark
 * * True - Разрешено устанавливать третье состояние.
 * * False - Не разрешено устанавливать третье состояние.
 * 
 * Если установлен режим triState, то значение {@link value} может быть "null".
 */
/**
 * @name Controls/_toggle/Checkbox/resources/CheckboxMarker#value
 * @cfg {Boolean|null} Значение, которое определяет текущее состояние.
 * @default False
 * @remark
 * * True - чекбокс в состоянии "отмечено".
 * * False - чекбокс в состоянии "не отмечено". Это состояние по умолчанию.
 * * null - состояние чекбокса при включенной опции {@link triState}.
 */
export default CheckboxMarker;
