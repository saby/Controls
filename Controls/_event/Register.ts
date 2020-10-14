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

export = EventRegistrator;

