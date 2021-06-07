define('Controls-demo/Compound/CompoundControl', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!Controls-demo/Compound/CompoundControl',
   'Core/CommandDispatcher'
], function(Control, dotTplFn, CommandDispatcher) {
   'use strict';

   var CompoundControl = Control.extend({
      $protected: {
         _options: {
            someOption: 'Default value',
            buildChild: false
         }
      },

      _dotTplFn: dotTplFn,
      _lastCommandArgumentCount: 0,
      _isFirstCommandArgumentArray: false,

      $constructor: function() {
         CommandDispatcher.declareCommand(this, 'TestCommand', this._testCommandHandler);
      },

      _testCommandHandler: function() {
         this._lastCommandArgumentCount = arguments.length;
         this._isFirstCommandArgumentArray = Array.isArray(arguments[0]);

         // stop command propagation
         return true;
      }
   });

   var origInit = CompoundControl.prototype.init;
   CompoundControl.prototype.init = function() {
      origInit.apply(this, arguments);
      this.setEnabled(false);
      this.getParent().setEnabled(true);
   };

   return CompoundControl;
});
