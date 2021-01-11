import {Control} from 'UI/Base';
import template = require('wml!Controls/_compatiblePopup/OldNotification/OldNotification');

var OldNotification = Control.extend({
   _template: template,

   _afterMount: function() {
      this._options.waitCallback();
   },
   _close: function() {
      // После правок https://online.sbis.ru/opendoc.html?guid=5011523a-1e97-4e5b-be95-ed5c56b854b8 парент есть всегда
      if (this.getParent) {
         this.getParent().close();
      }
   }
});
OldNotification._theme = ['Controls/compatiblePopup'];
export default OldNotification;
