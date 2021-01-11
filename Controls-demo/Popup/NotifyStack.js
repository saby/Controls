define('Controls-demo/Popup/NotifyStack',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/NotifyStack',
   ],
   function(Base, template) {
      'use strict';

      var NotifyStack = Base.Control.extend({
         _template: template,
         _textValue1: '',
         _textValue2: '',

         _sendResult: function() {
            this._notify('sendResult', [this._textValue1, this._textValue2], { bubbling: true });
         }
      });

      return NotifyStack;
   });
