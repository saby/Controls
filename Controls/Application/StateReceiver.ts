import {Serializer} from 'UI/State';
import {Logger} from 'UI/Utils';

export = class StateReceiver {
   receivedStateObjectsArray: object = {};
   _deserialized: object = {};

   serialize() {
      let slr;
      let serializedMap = {};
      let allAdditionalDeps = {};
      let allRecStates = this.receivedStateObjectsArray;
      for (let key in allRecStates) {
         if (allRecStates.hasOwnProperty(key)) {
            let receivedState = allRecStates[key].getState();
            if (receivedState) {
               serializedMap[key] = receivedState;
            }
         }
      }

      slr = new Serializer();
      let serializedState = JSON.stringify(serializedMap, slr.serialize);
      Serializer.componentOptsReArray.forEach(function(re) {
         serializedState = serializedState.replace(re.toFind, re.toReplace);
      });
      serializedState = serializedState.replace(/\\"/g, '\\\\"');
      let addDeps = StateReceiver.getDepsFromSerializer(slr);
      for (let dep in addDeps) {
         if (addDeps.hasOwnProperty(dep)) {
            allAdditionalDeps[dep] = true;
         }
      }

      return {
         serialized: serializedState,
         additionalDeps: allAdditionalDeps
      };
   }
   deserialize(str) {
      let slr = new Serializer();
      try {
         this._deserialized = JSON.parse(str, slr.deserialize);
      } catch (e) {
         Logger.error('Deserialize', 'Cant\'t deserialize ' + str);
      }
   }

   register(key, inst) {
      if (this._deserialized[key]) {
         inst.setState(this._deserialized[key]);
         delete this._deserialized[key];
      }
      if (typeof this.receivedStateObjectsArray[key] !== 'undefined') {
         Logger.warn('SRec::register', 'Try to register instance more than once or duplication of keys happened; current key is "' + key + '"');
      }
      this.receivedStateObjectsArray[key] = inst;
   }

   unregister(key) {
      delete this.receivedStateObjectsArray[key];
   }

   static getDepsFromSerializer(slr) {
      let moduleInfo;
      let deps = {};
      let modules = slr._linksStorage;
      let parts;
      for (let key in modules) {
         if (modules.hasOwnProperty(key)) {
            moduleInfo = modules[key];
            if (moduleInfo.module) {
               parts = Serializer.parseDeclaration(moduleInfo.module);
               deps[parts.name] = true;
            }
         }
      }

      let addDeps = slr._depsStorage || {};
      for (let j in addDeps) {
         if (addDeps.hasOwnProperty(j)) {
            deps[j] = true;
         }
      }

      return deps;
   }
};
