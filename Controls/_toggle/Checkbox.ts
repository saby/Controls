import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import checkBoxTemplate = require('wml!Controls/_toggle/Checkbox/Checkbox');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {Logger} from 'UI/Utils';
import {
   ITooltip, ITooltipOptions, ICaption, ICaptionOptions, IIcon, IIconOptions,
   IIconSize, IIconSizeOptions, IIconStyle, IIconStyleOptions, IValidationStatus, IValidationStatusOptions} from 'Controls/interface';
export interface ICheckboxOptions extends IControlOptions, ICaptionOptions, IIconOptions, ITooltipOptions,
    IIconSizeOptions, IIconStyleOptions, IValidationStatusOptions {
   triState?: boolean;
   value?: boolean | null;
}

/**
 * Контрол, позволяющий пользователю управлять параметром с двумя состояниями — включено и отключено.
 *
 * <a href="/materials/demo-ws4-checkbox">Демо-пример</a>.
 *
 * @class Controls/_toggle/Checkbox
 * @extends Core/Control
 * @implements Controls/_interface/ICaption
 * @implements Controls/_interface/IIcon
 * @implements Controls/_interface/ITooltip
 * @implements Controls/_interface/IValidationStatus
 * @control
 * @public
 * @author Красильников А.С.
 * @category Toggle
 * @demo Controls-demo/Checkbox/CheckBoxDemoPG
 */

/*
 * Represents a control that a user can select and clear.
 *
 * <a href="/materials/demo-ws4-checkbox">Demo-example</a>.
 *
 * @class Controls/_toggle/Checkbox
 * @extends Core/Control
 * @implements Controls/_interface/ICaption
 * @implements Controls/_interface/IIcon
 * @implements Controls/_interface/ITooltip
 * @implements Controls/_interface/IIconStyle
 * @implements Controls/_interface/IIconSize
 * @control
 * @public
 * @author Красильников А.С.
 * @category Toggle
 * @demo Controls-demo/Checkbox/CheckBoxDemoPG
 */

/**
 * @name Controls/_toggle/Checkbox#triState
 * @cfg {Boolean} Определяет, разрешено ли устанавливать чекбоксу третье состояние — "не определен" (null).
 * @default False
 * @remark
 * True - Разрешено устанавливать третье состояние.
 * False - Не разрешено устанавливать третье состояние.
 * Если установлен режим triState, то значение может быть "null".
 * @example
 * Чекбокс с включенным triState.
 * <pre>
 *    Boolean variable value: <Controls.toggle:Checkbox on:valueChanged="_updateCheckBox()" triState="{{true}}" value="{{_checkBoxValue}}"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _updateCheckBox(event, value) {
 *          _checkBoxValue = value;
 *       }
 *       ...
 *    });
 * </pre>
 * @see option Value
 */

/*
 * @name Controls/_toggle/Checkbox#triState
 * @cfg {Boolean} Determines whether the Checkbox will allow three check status rather than two.
 * @default False
 * @remark
 * True - Enable triState.
 * False - Disable triState.
 * If the triState mode is set, then the value can be null.
 * @example
 * Checkbox with enabled triState.
 * <pre>
 *    Boolean variable value: <Controls.toggle:Checkbox on:valueChanged="_updateCheckBox()" triState="{{true}}" value="{{_checkBoxValue}}"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _updateCheckBox(event, value) {
 *          _checkBoxValue = value;
 *       }
 *       ...
 *    });
 * </pre>
 * @see option Value
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
 * @example
 * Чекбокс, регулирующий тему в контроле.
 * <pre>
 *    <Controls.toggle:Checkbox caption="Enable dark theme" value="{{_checkBoxValue}}" on:valueChanged="{{_darkThemeSwitched()}}"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _darkThemeSwitched(e, value) {
 *          _checkBoxValue = value;
 *          this._notify('themeChanged', [_checkBoxValue]);
 *       }
 *       ...
 *    });
 * </pre>
 * Чекбокс с включенной опцией triState.
 * <pre>
 *    Boolean variable value: <Controls.toggle:Checkbox on:valueChanged="_updateCheckBox()" triState="{{true}}" value="{{_checkBoxValue}}"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _updateCheckBox(event, value) {
 *          _checkBoxValue = value;
 *       }
 *       ...
 *    });
 * </pre>
 * @see option triState
 * @see event valueChanged()
 */

/*
 * @name Controls/_toggle/Checkbox#value
 * @cfg {Boolean|null} Current value, it's determines current state.
 * @default False
 * @remark
 * True - Selected checkbox state.
 * False - Unselected checkbox state. It is default state.
 * Null - TriState checkbox state.
 * Variant null of value this option is possible only when the triState option is enabled.
 * @example
 * Checkbox regulate theme in control.
 * <pre>
 *    <Controls.toggle:Checkbox caption="Enable dark theme" value="{{_checkBoxValue}}" on:valueChanged="{{_darkThemeSwitched()}}"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _darkThemeSwitched(e, value) {
 *          _checkBoxValue = value;
 *          this._notify('themeChanged', [_checkBoxValue]);
 *       }
 *       ...
 *    });
 * </pre>
 * Checkbox value when triState option is true.
 * <pre>
 *    Boolean variable value: <Controls.toggle:Checkbox on:valueChanged="_updateCheckBox()" triState="{{true}}" value="{{_checkBoxValue}}"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _updateCheckBox(event, value) {
 *          _checkBoxValue = value;
 *       }
 *       ...
 *    });
 * </pre>
 * @see option triState
 * @see event valueChanged()
 */

/**
 * @event Controls/_toggle/Checkbox#valueChanged Происходит при изменении состояния контрола.
 * @param {Boolean|null} New value.
 * @remark Событие необходимо для реагирования на изменения, внесенные пользователем в чекбокс. Значение, возвращаемое в событии, не вставляется в контрол, если не передать его обратно в поле в качестве опции. Значение может быть null только тогда, когда включена опция tristate.
 * @example
 * Пример:
 * <pre>
 *    <Controls.toggle:Checkbox value="{{_checkBoxValue}}" on:valueChanged="_valueChangedHandler()" />
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _valueChangedHandler(e, value) {
 *          this._checkBoxValue= value;
 *       }
 *       ...
 *    });
 * </pre>
 * @see value
 * @see triState
 */

/*
 * @event Controls/_toggle/Checkbox#valueChanged Occurs when state changes.
 * @param {Boolean|null} New value.
 * @remark This event should be used to react to changes user makes in the checkbox. Value returned in the event is not inserted in control unless you pass it back to the field as an option. Value may be null only when checkbox tristate option is true.
 * @example
 * Example description.
 * <pre>
 *    <Controls.toggle:Checkbox value="{{_checkBoxValue}}" on:valueChanged="_valueChangedHandler()" />
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _valueChangedHandler(e, value) {
 *          this._checkBoxValue= value;
 *       }
 *       ...
 *    });
 * </pre>
 * @see value
 * @see triState
 */

const mapTriState = {false: true, true: null, null: false};
const mapBoolState = {true: false, false: true};

class Checkbox extends Control<ICheckboxOptions> implements ICaption,
                                                            IIcon, ITooltip, IIconSize, IIconStyle, IValidationStatus {
   '[Controls/_interface/ITooltip]': boolean = true;
   '[Controls/_interface/ICaption]': boolean = true;
   '[Controls/_interface/IIcon]': boolean = true;
   '[Controls/_interface/IIconSize]': boolean = true;
   '[Controls/_interface/IIconStyle]': boolean = true;
   '[Controls/_interface/IValidationStatus]': boolean = true;

   // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
   protected _template: TemplateFunction = checkBoxTemplate;

   private _notifyChangeValue(value: boolean | null): void {
      this._notify('valueChanged', [value]);
   }

   private _clickHandler(): void {
      if (!this._options.readOnly) {
         const map = this._options.triState ? mapTriState : mapBoolState;
         this._notifyChangeValue(map[this._options.value + '']);
      }
   }

   // Удалено в 20.1100
   private _isTemplate(icon: TemplateFunction | string): boolean {
      if (typeof icon === 'function') {
         Logger.error('Controls.toggle:Checkbox: Опция icon должна иметь тип string.', this);
         return true;
      }

      return false;
   }

   static _theme: string[] = ['Controls/toggle', 'Controls/Classes'];

   static getDefaultOptions(): object {
      return {
         value: false,
         triState: false,
         iconSize: 'default',
         iconStyle: 'secondary',
         validationStatus: 'valid'
      };
   }

   static getOptionTypes(): object {
      return {
         triState: EntityDescriptor(Boolean),
         tooltip: EntityDescriptor(String)
      };
   }
}

export default Checkbox;
