define('Controls-demo/Popup/Opener/resources/DialogTpl',
   [
      'Env/Env',
      'Core/Control',
      'wml!Controls-demo/Popup/Opener/resources/DialogTpl',
   ],
   function(Env, Control, template) {
      'use strict';

      var PopupPage = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Popup/Opener/resources/StackHeader'],
         _close: function() {
            this._notify('close', [], { bubbling: true });
         }
      });
      return PopupPage;
   });
