import cExtend = require('Core/core-simpleExtend');
import Registrar = require('Controls/_event/Registrar');
import {IRegistrarConfig} from "./Registrar";

export interface IRegisterClassConfig {
    listenAll?: boolean;
}

export interface RegisterClassOptions {
   register?: unknown;
}

class RegisterClass {
    private _register: unknown;
    private _registrar: unknown;

    constructor(options: RegisterClassOptions) {
       this._register = options.register;
       this._registrar = new Registrar({register: this._register});
    }

    register(event: Event, registerType: string, component, callback, config: IRegistrarConfig = {}): void {
       if (registerType === this._register) {
          this._registrar.register(event, component, callback, config);
       }
    }

    unregister(event: Event, registerType: string, component, config: IRegistrarConfig = {}): void {
       if (registerType === this._register) {
          this._registrar.unregister(event, component, config);
       }
    }

   start(event): void {
      this._registrar.start.apply(this._registrar, arguments);
   }

   startOnceTarget(target): void {
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
