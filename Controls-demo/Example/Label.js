define('Controls-demo/Example/Label',
   [
      'UI/Base',
      'wml!Controls-demo/Example/Label/Label',

      'Controls/input',
   ],
   function(BaseMod, template) {
      'use strict';

      var ModuleClass = BaseMod.Control.extend({
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
