define('Controls-demo/Example/Input/PositionLabels',
   [
      'Core/Control',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/PositionLabels/PositionLabels',

      'Controls/input',
   ],
   function(Control, SetValueMixin, template) {
      'use strict';


      return Control.extend([SetValueMixin], {
         _template: template,
         _styles: ['Controls-demo/Example/resource/Base', 'Controls-demo/Example/Input/PositionLabels/PositionLabels', 'Controls-demo/Example/resource/BaseDemoInput/BaseDemoInput'],

         _labelClickHandler: function(event, labelName) {
            this._children[labelName].activate();
         }
      });
   });
