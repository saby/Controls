define('Controls-demo/Popup/PopupPageOld',
   [
      'Core/Control',
      'wml!Controls-demo/Popup/PopupPageOld',
      'SBIS3.CONTROLS/Action/List/OpenEditDialog',
      'Controls-demo/Popup/TestDialog',
   ],
   function (Control, template, OpenEditDialog) {
      'use strict';

      var PopupPage = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Popup/PopupPageOld'],

         constructor: function (cfg) {
            PopupPage.superclass.constructor.call(this, cfg);
         },


         openDialog: function () {
            this._children.dialog.open({
               opener: this._children.dialogButton
            });
         },

         openModalDialog: function () {
            this._children.modalDialog.open({});
         },

         openSticky: function () {
            this._children.sticky.open({
               target: this.getChildControlByName('stickyButton')._container,
               opener: this.getChildControlByName('stickyButton'),
               templateOptions: {
                  type: this._firstClick ? 'sticky' : 'dialog'
               }
            });
            this._firstClick = true;
         },

         openNotification: function () {
            this._children.notification.open({
               opener: this._children.notificationButton
            });
         },

         openStack: function () {
            this._children.stack.open({
               opener: this._children.stackButton
            });
         },

         openOldTemplate: function () {
            this._children.openOldTemplate.open({
               opener: this._children.stackButton2,
               isCompoundTemplate: true
            });
         },
         openFloatArea: function(event, tplName) {
            require([tplName], function() {
               new OpenEditDialog().execute({
                  template: tplName,
                  mode: 'floatArea',
                  dialogOptions: {
                     isStack: true
                  }
               });
            });
         },
         _onResult: function (result) {
            if( result ){
               alert(result);
            }
         }
      });

      return PopupPage;
   }
);