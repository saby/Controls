define("Controls/Application/StateReceiver", ["require", "exports", "UI/State", "UI/Utils"], function (require, exports, State_1, Utils_1) {
    "use strict";
    return /** @class */ (function () {
        function StateReceiver() {
            this.receivedStateObjectsArray = {};
            this._deserialized = {};
        }
        StateReceiver.prototype.serialize = function () {
            var slr;
            var serializedMap = {};
            var allAdditionalDeps = {};
            var allRecStates = this.receivedStateObjectsArray;
            for (var key in allRecStates) {
                if (allRecStates.hasOwnProperty(key)) {
                    var receivedState = allRecStates[key].getState();
                    if (receivedState) {
                        serializedMap[key] = receivedState;
                    }
                }
            }
            slr = new State_1.Serializer();
            var serializedState = JSON.stringify(serializedMap, slr.serialize);
            State_1.Serializer.componentOptsReArray.forEach(function (re) {
                serializedState = serializedState.replace(re.toFind, re.toReplace);
            });
            serializedState = serializedState.replace(/\\"/g, '\\\\"');
            var addDeps = StateReceiver.getDepsFromSerializer(slr);
            for (var dep in addDeps) {
                if (addDeps.hasOwnProperty(dep)) {
                    allAdditionalDeps[dep] = true;
                }
            }
            return {
                serialized: serializedState,
                additionalDeps: allAdditionalDeps
            };
        };
        StateReceiver.prototype.deserialize = function (str) {
            var slr = new State_1.Serializer();
            try {
                this._deserialized = JSON.parse(str, slr.deserialize);
            }
            catch (e) {
                Utils_1.Logger.error('Deserialize', 'Cant\'t deserialize ' + str);
            }
        };
        StateReceiver.prototype.register = function (key, inst) {
            if (this._deserialized[key]) {
                inst.setState(this._deserialized[key]);
                delete this._deserialized[key];
            }
            if (typeof this.receivedStateObjectsArray[key] !== 'undefined') {
                Utils_1.Logger.warn('SRec::register', 'Try to register instance more than once or duplication of keys happened; current key is "' + key + '"');
            }
            this.receivedStateObjectsArray[key] = inst;
        };
        StateReceiver.prototype.unregister = function (key) {
            delete this.receivedStateObjectsArray[key];
        };
        StateReceiver.getDepsFromSerializer = function (slr) {
            var moduleInfo;
            var deps = {};
            var modules = slr._linksStorage;
            var parts;
            for (var key in modules) {
                if (modules.hasOwnProperty(key)) {
                    moduleInfo = modules[key];
                    if (moduleInfo.module) {
                        parts = State_1.Serializer.parseDeclaration(moduleInfo.module);
                        deps[parts.name] = true;
                    }
                }
            }
            var addDeps = slr._depsStorage || {};
            for (var j in addDeps) {
                if (addDeps.hasOwnProperty(j)) {
                    deps[j] = true;
                }
            }
            return deps;
        };
        return StateReceiver;
    }());
});
