define('Controls-demo/Example/Label',
   [
      'Core/Control',
      'wml!Controls-demo/Example/Label/Label',

      'Controls/input',
   ],
   function(Control, template) {
      'use strict';

      var ModuleClass = Control.extend({
         _template: template,

         _value: 'text',

         _limitedCaption: 'Label with limited width',

         _switchBlocker: function() {
            this._lock = !this._lock;
         }
      });
   
      ModuleClass._styles = ['Controls-demo/Example/Label/Label', 'Controls-demo/Example/resource/Base'];

      return ModuleClass;
});
