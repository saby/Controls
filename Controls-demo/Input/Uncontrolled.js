define('Controls-demo/Input/Uncontrolled',
   [
      'UI/Base',
      'wml!Controls-demo/Input/Uncontrolled/Uncontrolled',

      'Controls/input',
   ],
   function(Base, template) {
      'use strict';

      var ModuleClass = Base.Control.extend({
         _template: template
      });
   
      ModuleClass._styles = ['Controls-demo/Input/Uncontrolled/Uncontrolled'];

      return ModuleClass;
});
