define('Controls-demo/Decorators/Number/Number',
   [
      'Core/Control',
      'wml!Controls-demo/Decorators/Number/Number',

      'Controls/input',
      'Controls/decorator',
   ],
   function(Control, template) {

      'use strict';

      var ModuleClass = Control.extend({
         _template: template,

         _number: 0,

         _fractionSize: 0
      });
   
      ModuleClass._styles = ['Controls-demo/Decorators/Number/Number'];

      return ModuleClass;
}
);
