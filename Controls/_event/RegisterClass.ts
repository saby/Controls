import {Control} from 'UI/Base';
import Registrar from 'Controls/_event/Registrar';
import {IRegistrarConfig} from './Registrar';
import {SyntheticEvent} from 'Vdom/Vdom';

export interface IRegisterClassOptions {
    register?: string;
}

class RegisterClass {
    private _register: string;
    private _registrar: Registrar;

    constructor(options: IRegisterClassOptions) {
       this._register = options.register;
       this._registrar = new Registrar();
    }

    register(
        event: SyntheticEvent,
        registerType: string,
        component: Control,
        callback: Function,
        config: IRegistrarConfig = {}): void {
       if (registerType === this._register) {
          this._registrar.register(event, component, callback, config);
       }
    }

    unregister(
        event: SyntheticEvent,
        registerType: string,
        component: Control,
        config: IRegistrarConfig = {}): void {
       if (registerType === this._register) {
          this._registrar.unregister(event, component, config);
       }
    }

   start(event: SyntheticEvent): void {
      this._registrar.start.apply(this._registrar, arguments);
   }

   startOnceTarget(target: Control): void {
       const argsClone = Array.prototype.slice.call(arguments);
       argsClone.splice(0, 1);
       this._registrar.startOnceTarget(target, ...argsClone);
   }

   destroy(): void {
      if (this._registrar) {
         this._registrar.destroy();
         this._registrar = null;
         this._register = null;
      }
   }
}

export default RegisterClass;
