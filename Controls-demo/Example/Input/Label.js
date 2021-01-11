define('Controls-demo/Example/Input/Label',
   [
      'UI/Base',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Label/Label',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(BaseMod, SetValueMixin, template) {
      'use strict';

      var ModuleClass = BaseMod.Control.extend([SetValueMixin], {
         _template: template,

         _labelClickHandler: function(event, nameText) {
            this._children[nameText].activate();
         }
      });
   
      ModuleClass._styles = ['Controls-demo/Example/resource/Base', 'Controls-demo/Controls-demo'];

      return ModuleClass;
});
