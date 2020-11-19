/**
 * Created by dv.zuev on 17.01.2018.
 * Компонент слушает события "снизу". События register и сохраняет Listener'ы в списке
 * то есть, кто-то снизу сможет услышать события верхних компонентов через это отношение
 */
import Control = require('Core/Control');
import template = require('wml!Controls/_event/Register');
import entity = require('Types/entity');
import {IRegistrarConfig} from './Registrar';
import RegisterClass from './RegisterClass';
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
const EventRegistrator = Control.extend({
   _template: template,
   _register: null,
   _beforeMount(newOptions): void {
      if (constants.isBrowserPlatform) {
         this._forceUpdate = function() {
            // Do nothing
            // This method will be called because of handling event.
         };
         this._register = new RegisterClass({ register: newOptions.register });
      }
   },
   _registerIt(event, registerType, component, callback, config: IRegistrarConfig = {}): void {
      this._register.register(event, registerType, component, callback, config);
   },
   _unRegisterIt(event, registerType, component, config: IRegistrarConfig = {}): void {
      this._register.unregister(event, registerType, component, config);
   },
   start(): void {
      this._register.start.apply(this._register, arguments);
   },
   _beforeUnmount(): void {
      if (this._register) {
         this._register.destroy();
         this._register = null;
      }
   }
});

EventRegistrator.getOptionTypes = function() {
   return {
      register: entity.descriptor(String).required()
   };
};

/**
 * @name Controls/_event/Register#register
 * @cfg {String} Имя события, которое генерируется на зарегистрированных {@link Controls/event:Listener} при вызове метода {@link start}.
 */

/**
 * Оповещает зарегистрированные {@link Controls/event:Listener}.
 * @name Controls/_event/Register#start
 * @function 
 */
export = EventRegistrator;

