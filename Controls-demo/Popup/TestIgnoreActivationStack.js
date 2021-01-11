/**
 * Created by as.krasilnikov on 23.11.2018.
 */
define('Controls-demo/Popup/TestIgnoreActivationStack',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/TestIgnoreActivationStack'
   ],
   function(Base, template) {
      'use strict';

      var TestIgnoreActivationStack = Base.Control.extend({
         _template: template,
         _openConfirmation: function(e) {
            this._children.confirmDialog.open({
               opener: this._options.fakeOpener,
               message: 'На сайте ничего не произошло. Обновить страницу?',
               details: 'Фокус уже в этом окне, по esc можно его закрыть'
            }).addCallback(function(result) {
               if (result) {
                  window.alert('Обнови сам по f5');
               }
            });
         },

         _openStack: function() {
            this._children.stack.open({
               maxWidth: 600,
               opener: this
            });

            setTimeout(this._openNotification.bind(this), 1000);
         },

         _openNotification: function() {
            this._children.notification.open({
               opener: this._options.fakeOpener
            });
         }
      });

      return TestIgnoreActivationStack;
   });
