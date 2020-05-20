define('Controls-demo/Example/Input/Area',
   [
      'Core/Control',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Area/Area',

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
