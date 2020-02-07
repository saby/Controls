import CommandDispatcher = require('Core/CommandDispatcher');
import Control = require('Lib/Control/CompoundControl/CompoundControl');
import template = require('wml!Controls/_compatiblePopup/Notification/Notification');

/**
 * Замена SBIS3.CONTROLS/NotificationPopup при открытии нотификационных окон через vdom механизм.
 */

/**
 * @name Controls/Popup/Templates/Notification/Compatible#headerTemplate
 * @cfg {Function} Устанавливает шаблон шапки нотификационного уведомления.
 */

/**
 * @name Controls/Popup/Templates/Notification/Compatible#bodyTemplate
 * @cfg {Function} Устанавливает шаблон для содержимого нотификационного уведомления.
 */

/**
 * @name Controls/Popup/Templates/Notification/Compatible#footerTemplate
 * @cfg {Function} Устанавливает шаблон футера нотификационного уведомления.
 */

/**
 * @name Controls/Popup/Templates/Notification/Compatible#closeButton
 * @cfg {Boolean} Должна ли быть кнопка закрытия.
 */

/**
 * @name Controls/Popup/Templates/Notification/Compatible#icon
 * @cfg {String} Иконка в шапке.
 */

/**
 * @name Controls/Popup/Templates/Notification/Compatible#_opener
 * @cfg {String} Инстанс vdom opener.
 */

/**
 * @name Controls/Popup/Templates/Notification/Compatible#_def
 * @cfg {Core/Deferred} Deffered в callback которого приходит инстанс компонента.
 */
const Compatible = Control.extend({
   _dotTplFn: template,

   $constructor(): void {
      /**
       * Поддерка комманды close брошеная из дочерних контролов.
       */
      CommandDispatcher.declareCommand(this, 'close', this.close.bind(this));
   },

   init(): void {
      Compatible.superclass.init.apply(this, arguments);

      this._options._def.callback(this);
   },

   /**
    * Прикладники обращаются к методу open для открытия. Раньше они имели popup, а сейчас текущий компонент.
    */
   open(): void {
      this._options._opener.open();
   },

   /**
    * Прикладники обращаются к методу close для закрытия. Раньше они имели popup, а сейчас текущий компонент.
    */
   close(): void {
      if (!this.isDestroyed()) {
         const compoundContainer = this.getParent();
         const vdomNotificationTemplate = compoundContainer._logicParent;
         vdomNotificationTemplate._notify('close', [], { bubbling: true });
      }
   }
});
Compatible._theme = ['Controls/compatiblePopup'];
export default Compatible;
