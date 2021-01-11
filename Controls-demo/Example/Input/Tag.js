define('Controls-demo/Example/Input/Tag',
   [
      'UI/Base',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Tag/Tag',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Base, SetValueMixin, template) {
      'use strict';

      return Base.Control.extend([SetValueMixin], {
         _template: template,

         _currentActiveTag: null,

         _secondaryValue: '10 500.00',

         _successValue: '10 500.00',

         _warningValue: '10 500.00',

         _dangerValue: '10 500.00',

         _infoValue: '10 500.00',

         _primaryValue: '10 500.00',

         _showInfoBox: function(event, style, target) {
            var cfg = {
               target: target,
               message: 'Tooltip text',
               targetSide: 'top',
               alignment: 'end',
               style: style,

            };

            this._notify('openInfoBox', [cfg], {
               bubbling: true
            });
         }
      });
   });
