define('Controls-demo/Example/Input/Password',
   [
      'UI/Base',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Password/Password',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Base, SetValueMixin, template) {
      'use strict';

      return Base.Control.extend([SetValueMixin], {
         _template: template
      });
   });
