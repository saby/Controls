import Control = require('Core/Control');
import template = require('tmpl!Controls/_lookup/Opener');

/**
 * Контрол, который открывает всплывающее окно со списком, располагающимся справа от контентной области на всю высоту экрана, из которого можно выбрать значение.
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/layout-selector-stack/ Подробнее}.
 *
 * Здесь вы можете увидеть <a href="/materials/demo-ws4-engine-selector-browser">демонстрационный пример</a>.
 *
 * @class Controls/_lookup/Opener
 * @control
 * @extends Controls/_popup/Opener/Stack
 * @public
 * @author Герасимов А.М.
 */
/*
 * Component that opens the popup with list, to the right of content area at the full height of the screen, from which you can select a value. {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/layout-selector-stack/ See more}.
 *
 * Here you can see <a href="/materials/demo-ws4-engine-selector-browser">demo-example</a>.
 *
 * @class Controls/_lookup/Opener
 * @control
 * @extends Controls/_popup/Opener/Stack
 * @public
 * @author Gerasimov A.M.
 */

var SelectorOpener = Control.extend({

   _template: template,

   open: function (cfg) {
      return this._children.stackOpener.open(cfg || {});
   },

   close: function () {
      return this._children.stackOpener.close();
   }

});

export = SelectorOpener;


