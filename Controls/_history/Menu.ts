import {Button as Menu, MenuUtils} from 'Controls/dropdown';
import {IoC} from "Env/Env";

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
   }
});

export = HistoryMenu;
