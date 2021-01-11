define('Controls-demo/NotificationDemo/NotificationDemo',
   [
      'UI/Base',
      'wml!Controls-demo/NotificationDemo/NotificationDemo',
      'wml!Controls-demo/Popup/Opener/resources/CustomNotification'
   ],
   function(Base, template) {

      'use strict';

      return Base.Control.extend({
         _template: template,

         _openNotification: function(e, index) {
            this._children['myOpener' + index].open();
         },

         _closeNotification: function(e, index) {
            this._children['myOpener' + index].close();
         }
      });
   });
