import {Control} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/Notification/Opener/NotificationContent');

      var NotificationContent = Control.extend({
         _template: template,
         _mouseenterHandler: function(event) {
            this._notify('popupMouseEnter', [event]);
         },

         _mouseleaveHandler: function(event) {
            this._notify('popupMouseLeave', [event]);
         }
      });

      export = NotificationContent;

