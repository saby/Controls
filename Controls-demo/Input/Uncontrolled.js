define('Controls-demo/Input/Uncontrolled',
   [
      'UI/Base',
      'wml!Controls-demo/Input/Uncontrolled/Uncontrolled',

      'Controls/input',
   ],
   function(Base, template) {
      'use strict';

      return Base.Control.extend({
         _template: template,
         _styles: ['Controls-demo/Input/Uncontrolled/Uncontrolled'],
      });
   });
