import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import { SyntheticEvent } from 'Vdom/Vdom';
import DoubleSwitchTemplate = require('wml!Controls/_toggle/DoubleSwitch/DoubleSwitch');
import toggleTemplate = require('wml!Controls/_toggle/DoubleSwitch/resources/DoubleSwitchToggle');
import textTemplate = require('wml!Controls/_toggle/DoubleSwitch/resources/DoubleSwitchText');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ICheckable, ICheckableOptions} from './interface/ICheckable';
import {ITooltip, ITooltipOptions} from 'Controls/interface';

export interface IDoubleSwitchOptions extends IControlOptions, ICheckableOptions, ITooltipOptions {
   captions?: string[];
   orientation?: string;
}
/**
 * Двойной переключатель, который позволяет выбрать один из двух взаимоисключающих вариантов.
 *
 * <a href="/materials/demo-ws4-switchers">Демо-пример</a>.
 *
 * @class Controls/_toggle/DoubleSwitch
 * @extends Core/Control
 * @implements Controls/_toggle/interface/ICheckable
 * @implements Controls/_interface/ITooltip
 * @control
 * @public
 * @author Красильников А.С.
 * @category Toggle
 *
 * @demo Controls-demo/Switch/DoubleSwitchDemo
 * @css @line-height_DoubleSwitch_vertical Line-height of vertical double switcher. It's align vertical switch toggle.
 */

/*
 * Switch with two captions and with support two orientation.
 *
 * <a href="/materials/demo-ws4-switchers">Demo-example</a>.
 *
 * @class Controls/_toggle/DoubleSwitch
 * @extends Core/Control
 * @implements Controls/_toggle/interface/ICheckable
 * @implements Controls/_interface/ITooltip
 * @control
 * @public
 * @author Красильников А.С.
 * @category Toggle
 *
 * @demo Controls-demo/Switch/DoubleSwitchDemo
 *
 * @css @line-height_DoubleSwitch_vertical Line-height of vertical double switcher. It's align vertical switch toggle.
 */

/**
 * @name Controls/_toggle/DoubleSwitch#captions
 * @cfg {Array.<String>} Массив из двух подписей. Если количество подписей не равно двум, то возникает ошибка.
 */

/*
 * @name Controls/_toggle/DoubleSwitch#captions
 * @cfg {Array.<String>} Array of two captions. If caption number is not equal to two, then an error occurs.
 */

/**
 * @name Controls/_toggle/DoubleSwitch#orientation
 * @cfg {String} Ориентация двойного переключателя в пространстве.
 * @variant horizontal Горизонтальная ориентация. Значение по умолчанию.
 * @variant vertical Вертикальная ориентация.
 */

/*
 * @name Controls/_toggle/DoubleSwitch#orientation
 * @cfg {String} Double switch orientation in space.
 * @variant horizontal Horizontal orientation. It is default value.
 * @variant vertical Vertical orientation.
 */
const CAPTIONS_LENGTH = 2;
class DoubleSwitch extends Control<IDoubleSwitchOptions> implements ICheckable, ITooltip {
   '[Controls/_interface/ITooltip]': true;
   '[Controls/_toggle/interface/ICheckable]': true;

   // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
   protected _template: TemplateFunction = DoubleSwitchTemplate;

   protected _toggleTemplate: Function = toggleTemplate;
   protected _textTemplate: Function = textTemplate;
   protected _toggleHoverState: boolean = false;

   private _checkCaptions(captions: string[]): void {
      if (captions.length !== CAPTIONS_LENGTH) {
         throw new Error('You must set 2 captions.');
      }
   }

   private _toggleSwitchHoverState(e: SyntheticEvent<Event>, toggledState?: boolean): void {
      this._toggleHoverState = !!toggledState;
   }

   protected _clickTextHandler(e: SyntheticEvent<Event>, _nextValue: boolean): void {
      if (this._options.value !== _nextValue && !this._options.readOnly) {
         this._notifyChanged();
         this._toggleSwitchHoverState(e, false);
      }
   }

   private _notifyChanged(): void {
      this._notify('valueChanged', [!this._options.value]);
   }

   protected _clickToggleHandler(): void {
      if (!this._options.readOnly) {
         this._notifyChanged();
      }
   }

   protected _beforeMount(newOptions: IDoubleSwitchOptions): void {
      this._checkCaptions(newOptions.captions);
   }

   protected _beforeUpdate(newOptions: IDoubleSwitchOptions): void {
      this._checkCaptions(newOptions.captions);
   }

   static _theme: string[] = ['Controls/toggle'];
   static getDefaultOptions(): object {
      return {
         value: false
      };
   }
   static getOptionTypes(): object {
      return {
         value: EntityDescriptor(Boolean),
         orientation: EntityDescriptor(String).oneOf([
            'vertical',
            'horizontal'
         ]),

         // TODO: сделать проверку на массив когда будет сделана задача
         // https://online.sbis.ru/opendoc.html?guid=2016ea16-ed0d-4413-82e5-47c3aeaeac59
         captions: EntityDescriptor(Object)
      };
   }
}

export default DoubleSwitch;
