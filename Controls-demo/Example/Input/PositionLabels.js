define('Controls-demo/Example/Input/PositionLabels',
   [
      'UI/Base',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/PositionLabels/PositionLabels',

      'Controls/input',
   ],
   function(BaseMod, SetValueMixin, template) {
      'use strict';


      var ModuleClass = BaseMod.Control.extend([SetValueMixin], {
         _template: template,

         _labelClickHandler: function(event, labelName) {
            this._children[labelName].activate();
         }
      });
   
      ModuleClass._styles = ['Controls-demo/Example/resource/Base', 'Controls-demo/Example/Input/PositionLabels/PositionLabels', 'Controls-demo/Example/resource/BaseDemoInput/BaseDemoInput', 'Controls-demo/Controls-demo'];

      return ModuleClass;
});
