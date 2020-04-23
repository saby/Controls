define('Controls-demo/Example/Input/Label',
   [
      'Core/Control',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Label/Label',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Control, SetValueMixin, template) {
      'use strict';

      return Control.extend([SetValueMixin], {
         _template: template,
         _styles: ['Controls-demo/Example/resource/Base'],

         _labelClickHandler: function(event, nameText) {
            this._children[nameText].activate();
         }
      });
   });
