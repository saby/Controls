define('Controls-demo/Example/Input/Mask',
   [
      'Core/Control',
      'tmpl!Controls-demo/Example/Input/Mask/Mask',

      'Controls/Input/Mask',
      'css!Controls-demo/Example/resource/Base'
   ],
   function(Control, template) {

      'use strict';

      return Control.extend({
         _template: template,

         _mobilePhone: '+7 '
      });
   }
);
