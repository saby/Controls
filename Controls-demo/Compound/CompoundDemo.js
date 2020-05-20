define('Controls-demo/Compound/CompoundDemo', [
   'Core/Control',
   'wml!Controls-demo/Compound/CompoundDemo',
   'Types/source',
   'Lib/Control/LayerCompatible/LayerCompatible',
   'Env/Env',
], function(Control, template, source, LayerCompatible, Env) {
   'use strict';

   var CompoundDemo = Control.extend({
      _template: template,
      _compatibleReady: false,
      _rebuildTypeItems: null,
      // Options
      _hasComponentOptionsOption: true,
      _redrawOnOptionsChangeOption: true,
      _buildChildOption: true,
      _someTemplate: {
         0: { func: function() { return 'old template'; } },
         isDataArray: true
      },
      _newTemplate: {
         0: { func: function() { return 'new'; } },
         isDataArray: true
      },
      // Rebuild
      _rebuildType: 0,
      // Checkpoints
      _optionsTestValue: false,
      _lifecycleTestValue: false,
      _rebuildTestValue: false,
      _compatibleTestValue: false,
      _enabledTestValue: false,
      _commandTestValue: false,
      _destroyedTestValue: false,

      resetCheckersHandler: function() {
         this._optionsTestValue = false;
         this._lifecycleTestValue = false;
         this._rebuildTestValue = false;
         this._compatibleTestValue = false;
         this._enabledTestValue = false;
         this._commandTestValue = false;
         this._destroyedTestValue = false;
         for (var eventName in this.expectedLifecycleHooks) {
            if (this.expectedLifecycleHooks.hasOwnProperty(eventName)) {
               this.expectedLifecycleHooks[eventName] = false;
            }
         }
         this._forceUpdate();
      },
      testOptionsHandler: function() {
         var result = true;
         if (this._hasComponentOptionsOption) {
            var options = this._children.compoundContainer._options.componentOptions;
            for (var optName in this.componentOptions) {
               if (this.componentOptions.hasOwnProperty(optName)) {
                  if (this.componentOptions[optName] !== options[optName]) {
                     Env.IoC.resolve('ILogger').error('CompoundControl should have ' + optName + ' option');
                     result = false;
                  }
               }
            }
         }
         else {
            result = typeof this._children.compoundContainer._options.componentOptions === 'undefined';
         }
         this._optionsTestValue = result;
         this._forceUpdate();
      },
      testLifecycleHandler: function() {
         var isOk = true;
         for (var eventName in this.lifecycleHooks) {
            if (this.expectedLifecycleHooks.hasOwnProperty(eventName)) {
               isOk = isOk && this.expectedLifecycleHooks[eventName];
            }
         }
         this._lifecycleTestValue = isOk;
         this._forceUpdate();
      },
      resetRebuildHandler: function() {
         var self = this;
         var cc = this._children.compoundContainer;
         if (!this.originRebuildChildControl) {
            this.originRebuildChildControl = cc.rebuildChildControl;
            cc.rebuildChildControl = function() {
               self._rebuildTestValue = true;
               self.originRebuildChildControl.apply(self._children.compoundContainer, arguments);
            };
         }
         this._rebuildTestValue = false;
         this._forceUpdate();
      },
      testCompatibilityHandler: function() {
         var result = true;
         var cc = this._children.compoundContainer;
         if (cc.hasChildControlByName('innerControl') && cc.getChildControlByName('innerControl').getParent() !== cc) {
            Env.IoC.resolve('ILogger').error('CompoundControl\'s parent should be CompoundContainer');
            result = false;
         }
         if (this._buildChildOption && cc.hasChildControlByName('innerNestedChild') && cc.getChildControlByName('innerNestedChild').getTopParent() !== cc) {
            Env.IoC.resolve('ILogger').error('Nested CompoundControl\'s top parent should be CompoundContainer');
            result = false;
         }
         this._compatibleTestValue = result;
         this._forceUpdate();
      },
      testEnabledHandler: function() {
         var result = true;
         var cc = this._children.compoundContainer;
         var compoundChild = cc.hasChildControlByName('innerControl') ? cc.getChildControlByName('innerControl') : cc;
         // must be true on init
         if (!compoundChild.isEnabled()) {
            result = false;
            Env.IoC.resolve('ILogger').error('CompoundControl does not allow child control to call setEnabled on init');
         }
         if (!cc.isEnabled()) {
            result = false;
            Env.IoC.resolve('ILogger').error('CompoundControl does not allow child control to call setEnabled on init');
         }
         cc.setEnabled(false);
         if (compoundChild.isEnabled()) {
            result = false;
            Env.IoC.resolve('ILogger').error('Child control should be enabled by setEnabled(true)');
         }
         if (cc.isEnabled()) {
            result = false;
            Env.IoC.resolve('ILogger').error('CompoundContainer should be enabled by setEnabled(true)');
         }
         cc.setEnabled(true);
         if (!compoundChild.isEnabled()) {
            result = false;
            Env.IoC.resolve('ILogger').error('Child control should be enabled by setEnabled(false)');
         }
         if (!cc.isEnabled()) {
            result = false;
            Env.IoC.resolve('ILogger').error('CompoundContainer should be enabled by setEnabled(false)');
         }
         this._enabledTestValue = result;
         this._forceUpdate();
      },
      testCommandsHandler: function() {
         var result = true;
         var self = this;
         var cc = this._children.compoundContainer;
         var compoundChild = cc.hasChildControlByName('innerControl') ? cc.getChildControlByName('innerControl') : null;
         if (!this.origNotifyVdom) {
            this.origNotifyVdom = cc._notifyVDOM;
            this.timesCommandCatchEmitted = 0;
            cc._notifyVDOM = function() {
               var realResult, overrideResult;
               if (arguments[0] === 'commandCatch') {
                  var cmdName = arguments[1][0];
                  var args = Array.prototype.slice.call(arguments[1], 1);

                  self.timesCommandCatchEmitted++;

                  if (cmdName === 'ParentNoResultCommand') {
                     if (args.length !== 1) {
                        Env.IoC.resolve('ILogger').error('ParentNoResultCommand does not have one argument of array type');
                     }
                     if (!Array.isArray(args[0])) {
                        Env.IoC.resolve('ILogger').error('ParentNoResultCommand does not have one argument of array type');
                     }
                  } else if (cmdName === 'ParentSumCommand') {
                     if (args.length !== 2) {
                        Env.IoC.resolve('ILogger').error('ParentSumCommand does not have two number arguments');
                     }
                     overrideResult = args[0] + args[1];
                  }
               }
               realResult = self.origNotifyVdom.apply(this, arguments);
               return overrideResult || realResult;
            };
         }
         if (compoundChild) {
            // Test command
            cc.sendCommand('TestCommand', ['one argument', 'still one argument', 'argument one']);
            if (compoundChild._lastCommandArgumentCount !== 1 || this.timesCommandCatchEmitted !== 0) {
               result = false;
               Env.IoC.resolve('ILogger').error('Command handler should get 1 argument and should NOT have been emitted');
            }
            if (!compoundChild._isFirstCommandArgumentArray || this.timesCommandCatchEmitted !== 0) {
               result = false;
               Env.IoC.resolve('ILogger').error('First argument should have been an array and should NOT have been emitted');
            }
            // Test command
            cc.sendCommand('TestCommand', 1, ['argument two', 'still argument two'], { 'argument': 3 });
            if (compoundChild._lastCommandArgumentCount !== 3 || this.timesCommandCatchEmitted !== 0) {
               result = false;
               Env.IoC.resolve('ILogger').error('Command handler should get 3 arguments and should NOT have been emitted');
            }
            if (compoundChild._isFirstCommandArgumentArray || this.timesCommandCatchEmitted !== 0) {
               result = false;
               Env.IoC.resolve('ILogger').error('First argument should NOT have been an array and should NOT have been emitted');
            }
            // Test command
            cc.sendCommand('TestCommand', ['argument one'], ['argument two']);
            if (compoundChild._lastCommandArgumentCount !== 2 || this.timesCommandCatchEmitted !== 0) {
               result = false;
               Env.IoC.resolve('ILogger').error('Command handler should get 2 arguments and should NOT have been emitted');
            }
            if (!compoundChild._isFirstCommandArgumentArray || this.timesCommandCatchEmitted !== 0) {
               result = false;
               Env.IoC.resolve('ILogger').error('First argument should have been an array and should NOT have been emitted');
            }
            // Test command
            cc.sendCommand('TestCommand');
            if (compoundChild._lastCommandArgumentCount !== 0 || this.timesCommandCatchEmitted !== 0) {
               result = false;
               Env.IoC.resolve('ILogger').error('Command handler should get no arguments and should NOT have been emitted');
            }
            // Test command
            cc.sendCommand('ParentNoResultCommand', ['array', 'of', 'args']);
            if (this.timesCommandCatchEmitted !== 1) {
               result = false;
               Env.IoC.resolve('ILogger').error('Command handler should have been emitted');
            }
            // Test command
            var commandResult = cc.sendCommand('ParentSumCommand', 5, 7);
            if (this.timesCommandCatchEmitted !== 2) {
               result = false;
               Env.IoC.resolve('ILogger').error('Command handler should have been emitted');
            }
            if (commandResult !== 12) {
               result = false;
               Env.IoC.resolve('ILogger').error('CommandCatch handler should be able to override result');
            }
            if (!this.origGetParent) {
               this.origGetParent = cc.getParent;
               this.parentCommandCount = 0;
               var fakeParent = {
                  sendCommand: function() {
                     self.parentCommandCount++;
                  }
               };
               cc.getParent = function() {
                  return fakeParent;
               };
            }
            cc.sendCommand('TestCommand');
            if (this.parentCommandCount !== 0) {
               result = false;
               Env.IoC.resolve('ILogger').error('TestCommand should be handled by child control');
            }
            cc.sendCommand('UnknownCommand');
            if (this.parentCommandCount !== 1) {
               result = false;
               Env.IoC.resolve('ILogger').error('Parent should have been received the command EXACTLY once');
            }
            // Set origin values back
            cc._notifyVDOM = this.origNotifyVdom;
            cc.getParent = this.origGetParent;
            this.origNotifyVdom = null;
            this.origGetParent = null;
         }
         this._commandTestValue = result;
         this._forceUpdate();
      },
      testDestroyHandler: function() {
         if (!this._destroyedTestValue) {
            var result = true;
            var cc = this._children.compoundContainer;
            var ctrl = cc.hasChildControlByName('innerControl') ? cc.getChildControlByName('innerControl') : cc;
            cc.destroy();
            if (!ctrl.isDestroyed()) {
               Env.IoC.resolve('ILogger').error('CompoundControl should be destroyed');
               result = false;
            }
            this._destroyedTestValue = result;
            this._forceUpdate();
         }
      },

      _beforeMount: function() {
         this._rebuildTypeItems = new source.Memory({
            keyProperty: 'id',
            data: [
               { id: 0, title: 'No changes' },
               { id: 1, title: 'Add new option' },
               { id: 2, title: 'Change option' },
               { id: 3, title: 'Delete option' },
               { id: 4, title: 'Change template' },
               { id: 5, title: 'Change component' }
            ]
         });
         this._createLifecycleHandlers();
         this.originRebuildChildControl = null;
         this.origNotifyVdom = null;
      },
      _afterMount: function() {
         var self = this;
         LayerCompatible.load().addCallback(function() {
            self._compatibleReady = true;
            self._forceUpdate();
         });
      },
      _createLifecycleHandlers: function() {
         this.expectedLifecycleHooks = {
            onInit: false,
            onBeforeControlsLoad: false,
            onBeforeShow: false,
            onShow: false,
            onAfterLoad: false,
            onInitComplete: false,
            onAfterShow: false,
            onReady: false
         };
         this.lifecycleHooks = {};
         var self = this;
         function addHandler(event) {
            self.lifecycleHooks[event] = function() {
               self.expectedLifecycleHooks[event] = true;
               self._updateLifecycleValue();
            };
         }
         for (var eventName in this.expectedLifecycleHooks) {
            if (this.expectedLifecycleHooks.hasOwnProperty(eventName)) {
               addHandler(eventName);
            }
         }
      },

      _updateLifecycleValue: function() {
         var isOk = true;
         for (var eventName in this.lifecycleHooks) {
            if (this.expectedLifecycleHooks.hasOwnProperty(eventName)) {
               isOk = isOk && this.expectedLifecycleHooks[eventName];
            }
         }
         if (isOk) {
            this._runSimpleTests();
         }
      },
      _runSimpleTests: function() {
         this.testOptionsHandler();
         this.testLifecycleHandler();
      }
   });

   CompoundDemo._styles = ['Controls-demo/Compound/CompoundDemo'];

   return CompoundDemo;
});
