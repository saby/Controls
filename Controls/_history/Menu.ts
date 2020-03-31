import {Button as Menu, MenuUtils} from 'Controls/dropdown';
import {IoC, constants} from "Env/Env";

/**
 * Кнопка меню с историей, клик по которой открывает выпадающий список.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FButtons%2FMenu%2FMenu">Демо-пример</a>.
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
 * <a href="/materials/Controls-demo/app/Controls-demo%2FButtons%2FMenu%2FMenu">Demo-example</a>.
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
      if (constants.isBrowserPlatform) {
         IoC.resolve('ILogger').error('Контрол history:Menu является устаревшим, используйте dropdown:Button с опцией historyId');
      }
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
