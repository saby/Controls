define('Controls-demo/Example/Input/Text',
   [
      'UI/Base',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Text/Text',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Base, SetValueMixin, template) {
      'use strict';

      return Base.Control.extend([SetValueMixin], {
         _template: template,

         _labelClickHandler: function(event, nameText) {
            this._children[nameText].activate();
         }
      });
   });
