define('Controls-demo/Example/Input/Area',
   [
      'UI/Base',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Area/Area',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(BaseMod, SetValueMixin, template) {
      'use strict';

      var ModuleClass = BaseMod.Control.extend([SetValueMixin], {
         _template: template
      });
   
      ModuleClass._styles = ['Controls-demo/Example/resource/Base'];

      return ModuleClass;
});
