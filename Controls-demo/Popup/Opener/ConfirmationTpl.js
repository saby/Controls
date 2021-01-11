define('Controls-demo/Popup/Opener/ConfirmationTpl',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/Opener/ConfirmationTpl'
   ],

   function(Base, template) {
      'use strict';
      var DialogPG = Base.Control.extend({
         _template: template,
         _closeHandler: function() {
            this._notify('close', [], {bubbling: true});
         },
      });
      return DialogPG;
   });
