define('Controls-demo/NotificationDemo/NotificationTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/NotificationDemo/NotificationTemplate',
      'wml!Controls-demo/Popup/Opener/resources/CustomNotification',
   ],
   function(Control, template) {

      'use strict';

      var ModuleClass = Control.extend({
         _template: template,

         _openNotification: function(e, index) {
            this._children['myOpener' + index].open();
         },

         _closeNotification: function(e, index) {
            this._children['myOpener' + index].close();
         }
      });
   
      ModuleClass._styles = ['Controls-demo/NotificationDemo/NotificationTemplate'];

      return ModuleClass;
});
