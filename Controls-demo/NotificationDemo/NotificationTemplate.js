define('Controls-demo/NotificationDemo/NotificationTemplate',
   [
      'UI/Base',
      'wml!Controls-demo/NotificationDemo/NotificationTemplate',
      'wml!Controls-demo/Popup/Opener/resources/CustomNotification',
   ],
   function(Base, template) {

      'use strict';

      var ModuleClass = Base.Control.extend({
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
