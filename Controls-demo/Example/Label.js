define('Controls-demo/Example/Label',
   [
      'Core/Control',
      'wml!Controls-demo/Example/Label/Label',

      'Controls/input',
   ],
   function(Control, template) {
      'use strict';

      return Control.extend({
         _template: template,
         _styles: ['Controls-demo/Example/Label/Label', 'Controls-demo/Example/resource/Base'],

         _value: 'text',

         _limitedCaption: 'Label with limited width',

         _switchBlocker: function() {
            this._lock = !this._lock;
         }
      });
   });
