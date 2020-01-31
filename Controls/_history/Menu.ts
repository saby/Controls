import rk = require('i18n!Controls');
import {Button as Menu, MenuUtils} from 'Controls/dropdown';
import itemTemplate = require('wml!Controls/_history/resources/itemTemplate');
import {IoC} from "Env/Env";

var _private = {
   getMetaPinned: function (item) {
      return {
         $_pinned: !item.get('pinned')
      };
   }
};

/**
 * Кнопка меню с историей, клик по которой открывает выпадающий список.
 *
 * <a href="/materials/demo-ws4-button-menu">Демо-пример</a>.
 *
 * @class Controls/_history/Menu
 * @extends Controls/dropdown:Button
 * @control
 * @public
 * @author Герасимов А.М.
 * @category Menu
 * @demo Controls-demo/Menu/MenuVdom
 */

/*
 * Button menu with history by clicking on which a drop-down list opens.
 *
 * <a href="/materials/demo-ws4-button-menu">Demo-example</a>.
 *
 * @class Controls/_history/Menu
 * @extends Controls/dropdown:Button
 * @control
 * @public
 * @author Герасимов А.М.
 * @category Menu
 * @demo Controls-demo/Menu/MenuVdom
 */

var HistoryMenu = Menu.extend({
   _itemTemplate: itemTemplate,
   _hasIconPin: true,

   _beforeMount: function (options) {
      IoC.resolve('ILogger').warn('Контрол history:Menu является устаревшим, используйте dropdown:Button');
      this._offsetClassName = MenuUtils.cssStyleGeneration(options);
   },

   _beforeUpdate: function (newOptions) {
      if (this._options.size !== newOptions.size || this._options.icon !== newOptions.icon ||
         this._options.viewMode !== newOptions.viewMode) {
         this._offsetClassName = MenuUtils.cssStyleGeneration(newOptions);
      }
   },

   _onPinClickHandler: function (event, items) {
      var self = this;
      this._options.source.update(items[0].clone(), _private.getMetaPinned(items[0])).addCallback(function (result) {
         if (!result) {
            self._children.notificationOpener.open({
               template: 'Controls/popupTemplate:NotificationSimple',
               templateOptions: {
                  style: 'danger',
                  text: rk('Невозможно закрепить более 10 пунктов'),
                  icon: 'Alert'
               }
            });
         }
      });
   }
});

HistoryMenu._private = _private;

export = HistoryMenu;
