/**
 * Created by dv.zuev on 17.01.2018.
 * Компонент слушает события "снизу". События register и сохраняет Listener'ы в списке
 * то есть, кто-то снизу сможет услышать события верхних компонентов через это отношение
 */
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_event/Register');
import entity = require('Types/entity');
import RegisterClass, {IRegisterClassConfig, IRegisterClassOptions} from './RegisterClass';
import {constants} from 'Env/Env';

/**
 * Контрол, регистрирующий все вложенные {@link Controls/event:Listener} и генерирующий событие, заданное в опции {@link register}.
 * @class Controls/_event/Register
 * @extends UI/Base:Control
 *
 * @public
 * @remark
 * Подробнее о работе с контролом читайте <a href="/doc/platform/developmentapl/interface-development/controls/tools/autoresize/">здесь</a>.
 * @author Красильников А.С.
 */

export default class EventRegistrator extends Control {
   protected _template: TemplateFunction = template;
   private _register: RegisterClass = null;

   protected _beforeMount(options: IRegisterClassOptions): void {
      if (constants.isBrowserPlatform) {
         this._forceUpdate = () => {
            // Do nothing
            // This method will be called because of handling event.
         };
         this._register = new RegisterClass({ register: options.register });
      }
   }

   protected _registerIt(event: Event, registerType: string, component: Control,
                         callback: Function, config: IRegisterClassConfig = {}): void {
      this._register.register(event, registerType, component, callback, config);
   }

   protected _unRegisterIt(event: Event, registerType: string, component: Control,
                           config: IRegisterClassConfig = {}): void {
      this._register.unregister(event, registerType, component, config);
   }

   start(): void {
      this._register.start.apply(this._register, arguments);
   }

   protected _beforeUnmount(): void {
      if (this._register) {
         this._register.destroy();
         this._register = null;
      }
   }

   static getOptionTypes() {
      return {
         register: entity.descriptor(String).required()
      };
   }
}

/**
 * @name Controls/_event/Register#register
 * @cfg {String} Имя события, которое генерируется на зарегистрированных {@link Controls/event:Listener} при вызове метода {@link start}.
 */

/**
 * Оповещает зарегистрированные {@link Controls/event:Listener}.
 * @name Controls/_event/Register#start
 * @function
 */
