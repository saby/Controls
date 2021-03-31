import {Notification} from 'Controls/popupTemplate';
import template = require('wml!Controls/_compatiblePopup/Notification/Base');
import {TemplateFunction} from 'UI/Base';
import 'css!Controls/popupTemplate';

class NotificationBase extends Notification {
    protected _template: TemplateFunction = template;

   protected _beforeMount(options): void {
      var _this = this;

      _this._contentTemplateOptions = options.contentTemplateOptions;

      /**
       * После показа размеры контента изменяться, нужно сказать об этом потомкам.
       */
      _this._contentTemplateOptions.handlers = {
         onAfterShow(): void {
            _this._notify('controlResize', [], {bubbling: true});
         }
      };

      return  super._beforeMount(options);
   }
}

export default NotificationBase;
