define('Controls-demo/Popup/PopupPage',
   [
      'Core/Control',
      'wml!Controls-demo/Popup/PopupPage',
      'Controls/popup',
   ],
   function (Control, template, popupLib) {
      'use strict';

      var PopupPage = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Popup/PopupPage'],

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
               target: this._children.stickyButton,
               opener: this._children.stickyButton,
               templateOptions: {
                  template: 'Controls-demo/Popup/TestDialog',
                  type: 'sticky'
               }
            });
         },
         openStickyInScroll: function () {
            this._children.stickyInScroll.open({
               target: this._children.stickyInScrollButton,
               opener: this._children.stickyInScrollButton,
               templateOptions: {
                  template: 'Controls-demo/Popup/TestDialog',
                  type: 'sticky'
               }
            });
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

         openStackWithTemplateSizes: function () {
            this._children.stack2.open({
               opener: this._children.stackButton,
               templateOptions: {
                  width: '10000px'
               }
            });
         },

         openExecutingPopup: function () {
            this._children.executingStack.open({
               opener: this._children.stackButton,
               templateOptions: {text: 'first open'}
            });
            this._children.executingStack.open({
               opener: this._children.stackButton,
               templateOptions: {text: 'second open'}
            });
         },

         openNotifyStack: function() {
            this._children.notifyStack.open();
         },

         openChildStack: function() {
            this._children.childStack.open();
         },

         _notifyCloseHandler: function() {
            this._notifyStackText = 'Стековая панель закрылась';
         },

         _notifyOpenHandler: function() {
            this._notifyStackText = 'Стековая панель открылась';
         },

         _notifyResultHandler: function(event, result1, result2) {
            this._notifyStackText = 'Результат из стековой панели ' + result1 + ' : ' + result2;
         },

         openMaximizedStack: function () {
            this._children.maximizedStack.open({
               opener: this._children.stackButton
            });
         },

         openOldTemplate: function () {
            this._children.openOldTemplate.open({
               opener: this._children.stackButton2,
               isCompoundTemplate: true
            });
         },
         openStackWithPending: function() {
            this._children.openStackWithPending.open({
               opener: this._children.stackButton3
            });
         },
         openStackWithFormController: function() {
            this._children.openStackWithFormController.open({
               opener: this._children.stackButton4
            });
         },

         openIgnoreActivationStack: function() {
            this._children.ignoreActivationStack.open({
               opener: this._children.stackIgnoreButton,
               templateOptions: {
                  fakeOpener: this
               }
            });
         },

         openInfoBoxByHelper: function() {
            popupLib.Infobox.openPopup({
               message: 'Great job',
               target: this._children.helperButton1
            });
            setTimeout(function() {
               popupLib.Infobox.closePopup();
            }, 5000);
         },

         openNotificationByHelper: function() {
            popupLib.Notification.openPopup({
               template: 'Controls-demo/Popup/TestDialog',
               autoClose: false
            }).addCallback(function(popupId) {
               setTimeout(function() {
                  // don't use that. use autoClose option. it's example.
                  popupLib.Notification.closePopup(popupId);
               }, 5000);
            });
         },

         openConfirmationByHelper: function() {
            var self = this;
            popupLib.Confirmation.openPopup({
               message: 'Choose yes or no'
            }).addCallback(function(result) {
               self._helperConfirmationResult = result;
            });
         },

         openStickyByHelper: function () {
            popupLib.Sticky.openPopup({
               template: 'Controls-demo/Popup/TestDialog',
               opener: this._children.helperButton4,
               target: this._children.helperButton4
            }).addCallback(function(popupId) {
               setTimeout(function() {
                  popupLib.Sticky.closePopup(popupId);
               }, 5000);
            });
         },

         openStackByHelper: function() {
            popupLib.Stack.openPopup({
               template: 'Controls-demo/Popup/TestStack',
               opener: this._children.helperButton5
            }).addCallback(function(popupId) {
               setTimeout(function() {
                  popupLib.Stack.closePopup(popupId);
               }, 5000);
            });
         },

         openDialogByHelper: function() {
            popupLib.Dialog.openPopup({
               template: 'Controls-demo/Popup/TestDialog',
               opener: this._children.helperButton6
            }).addCallback(function(popupId) {
               setTimeout(function() {
                  popupLib.Dialog.closePopup(popupId);
               }, 5000);
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
