define('Controls-demo/Popup/TestMaximizedStack',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/TestMaximizedStack'
   ],
   function (Base, template) {
      'use strict';

      var TestMaximizedStack = Base.Control.extend({
         _template: template,
         _showMaximizedButton: false,
         _beforeMount: function(options) {
            this.updateMaximizeButton(options);
         },
         _beforeUpdate: function(options) {
            this.updateMaximizeButton(options);
         },
         updateMaximizeButton: function(options) {
            this._showMaximizedButton = options.stackMaxWidth - options.stackMinWidth > 200;
         },
         _close: function() {
            this._notify('close', [], { bubbling: true });
         }
      });

      TestMaximizedStack.getDefaultOptions = function() {
         return {
            minWidth: 500,
            width: 800,
            maxWidth: 1200
         }
      };

      return TestMaximizedStack;
   }
);
