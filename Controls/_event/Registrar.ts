import {SyntheticEvent} from 'Vdom/Vdom';
import {Control} from 'UI/Base';
export interface IRegistrarConfig {
   listenAll?: boolean;
}

class Registrar {

   _registry: object = {};

   register(
          event: SyntheticEvent,
          component: Control,
          callback: Function,
          config: IRegistrarConfig = {}): void {
      this._registry[component.getInstanceId()] = {component, callback};
      //TODO костыль https://online.sbis.ru/opendoc.html?guid=bc771725-ba40-4ac3-813e-962322fefd30
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
   unregister(
       event: SyntheticEvent,
       component: Control,
       config: IRegistrarConfig = {}): void {
      delete this._registry[component.getInstanceId()];
      if (!config.listenAll) {
         event.stopPropagation();
      }
   }
   start(): void {
      if (!this._registry) {
         return;
      }
      for (let i in this._registry) {
         if (this._registry.hasOwnProperty(i)) {
            const obj = this._registry[i];
            obj?.callback.apply(obj.component, arguments);
         }
      }
   }

   startAsync(): Promise<any> {
      if (!this._registry) {
         return;
      }
      const promises = [];
      for (let i in this._registry) {
         if (this._registry.hasOwnProperty(i)) {
            const obj = this._registry[i];
            const res = obj?.callback.apply(obj.component, arguments);
            promises.push(res);
         }
      }

      return Promise.all(promises);
   }

   startOnceTarget(target: Control): void {
      let argsClone;
      if (!this._registry) {
         return;
      }
      for (let i in this._registry) {
         if (this._registry.hasOwnProperty(i)) {
            const obj = this._registry[i];
            if (obj.component === target) {
               argsClone = Array.prototype.slice.call(arguments);
               argsClone.splice(0, 1);
               obj?.callback.apply(obj.component, argsClone);
            }
         }
      }
   }

   destroy(): void {
      this._registry = {};
   }

}

export default Registrar;
