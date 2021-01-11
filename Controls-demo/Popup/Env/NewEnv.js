define('Controls-demo/Popup/Env/NewEnv',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/Env/NewEnv',
      'SBIS3.CONTROLS/Action/OpenDialog',
      'Controls-demo/Popup/Env/template/oldTemplate',
      'Controls-demo/Popup/TestStack',
      'Controls/compatiblePopup'
   ],
   function(Base, template, OpenDialog) {
      'use strict';

      return Base.Control.extend({
         _template: template,

         openDialog: function() {
            this._children.dialog.open({
               opener: this._children.dialogButton
            });
         },

         openStack: function() {
            this._children.stack.open({
               opener: this._children.stackButton
            });
         },
         openNewTemplate: function(event, mode) {
            if (!this._action) {
               this._action = new OpenDialog({
               });
            }
            this._action.execute({
               mode: mode,
               template: 'Controls-demo/Popup/TestStack'
            });
         }
      });
   }
);
