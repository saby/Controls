import {Control} from 'UI/Base';

export interface IRegisterClassConfig {
    listenAll?: boolean;
}

export interface IRegisterClassOptions {
   register?: string;
}

class RegisterClass {
    private _register: string;
    private _registry: {
        [key: number]: {
            callback: Function;
            component: Control
        }
    } = {};

    constructor(options: IRegisterClassOptions) {
       this._register = options.register;
    }

    register(event: Event, registerType: string, component: Control, callback: Function, config: IRegisterClassConfig = {}): void {
       if (registerType === this._register) {
           const componentId = component.getInstanceId();
           this._registry[componentId] = {
               component,
               callback
           };
           const previousUnmountCallback = component.unmountCallback;
           component.unmountCallback = () => {
               if (typeof previousUnmountCallback === 'function') {
                   previousUnmountCallback();
               }
               this.unregister(event, component);
           };
           if (!config.listenAll) {
               event.stopPropagation();
           }
       }
    }

    unregister(event: Event, registerType: string, component: Control, config: IRegisterClassConfig = {}): void {
        if (registerType === this._register) {
            delete this._registry[component.getInstanceId()];
            if (!config.listenAll) {
                event.stopPropagation();
            }
        }
    }

   start(event): void {
      if (!this._registry) {
          return;
      }
      for (const i in this._registry) {
          if (this._registry.hasOwnProperty(i)) {
              const obj = this._registry[i];
              if (obj) {
                  obj.callback.apply(obj.component, arguments);
              }
          }
      }
   }

   startOnceTarget(target: Control): void {
       let argsClone;
       if (!this._registry) {
           return;
       }
       for (const i in this._registry) {
           if (this._registry.hasOwnProperty(i)) {
               const obj = this._registry[i];
               if (obj.component === target) {
                   argsClone = Array.prototype.slice.call(arguments);
                   argsClone.splice(0, 1);
                   if (obj) {
                       obj.callback.apply(obj.component, argsClone);
                   }
               }
           }
       }
   }

   destroy(): void {
       this._registry = null;
       this._register = null;
   }
}

export default RegisterClass;
