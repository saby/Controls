/**
 * Created by dv.zuev on 17.01.2018.
 * Компонент слушает события "снизу". События register и сохраняет Listener'ы в списке
 * то есть, кто-то снизу сможет услышать события верхних компонентов через это отношение
 */
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import RegisterTemplate = require('wml!Controls/_event/Register');
import {IRegistrarConfig} from './Registrar';
import {default as RegisterClass, IRegisterClassOptions} from './RegisterClass';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor} from 'Types/entity';

export interface IRegisterOptions extends IRegisterClassOptions, IControlOptions {}

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
class Register extends Control<IRegisterOptions> {
   protected _template: TemplateFunction = RegisterTemplate;
   private _register: RegisterClass = null;
   _beforeMount(newOptions: IRegisterOptions): void {
      if (typeof window !== 'undefined') {
         this._forceUpdate = () => {
            // Do nothing
            // This method will be called because of handling event.
         };
         this._register = new RegisterClass({ register: newOptions.register });
      }
   }
   protected _registerIt(
          event: SyntheticEvent,
          registerType: string,
          component: Control,
          callback: Function,
          config: IRegistrarConfig = {}
       ): void {
      this._register.register(event, registerType, component, callback, config);
   }

   protected _unRegisterIt(
          event: SyntheticEvent,
          registerType: string,
          component: Control,
          config: IRegistrarConfig = {}
       ): void {
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

   static getOptionTypes(): object {
      return {
         register: descriptor(String).required()
      };
   }
}

export default Register;

/**
 * @name Controls/_event/Register#register
 * @cfg {String} Имя события, которое генерируется на зарегистрированных {@link Controls/event:Listener} при вызове метода {@link start}.
 */

/**
 * Оповещает зарегистрированные {@link Controls/event:Listener}.
 * @name Controls/_event/Register#start
 * @function
 */
