define('Controls-demo/Example/Input/Phone',
   [
      'Core/Control',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Phone/Phone',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Control, SetValueMixin, template) {
      'use strict';

      var ModuleClass = Control.extend([SetValueMixin], {
         _template: template
      });
   
      ModuleClass._styles = ['Controls-demo/Example/resource/Base'];

      return ModuleClass;
});
