define('Controls-demo/NotificationDemo/NotificationTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/NotificationDemo/NotificationTemplate',
      'wml!Controls-demo/Popup/Opener/resources/CustomNotification',
   ],
   function(Control, template) {

      'use strict';

      return Control.extend({
         _template: template,
         _styles: ['Controls-demo/NotificationDemo/NotificationTemplate'],

         _openNotification: function(e, index) {
            this._children['myOpener' + index].open();
         },

         _closeNotification: function(e, index) {
            this._children['myOpener' + index].close();
         }
      });
   });
