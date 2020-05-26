import Control = require('Core/Control');
import template = require('tmpl!Controls/_lookup/Opener');

/**
 * Контрол, который открывает всплывающее окно со списком, располагающимся справа от контентной области на всю высоту экрана, из которого можно выбрать значение.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Engine-demo%2FSelector">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/layout-selector-stack/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_lookup.less">переменные тем оформления</a>
 *
 * @class Controls/_lookup/Opener
 * @control
 * @extends Controls/_popup/Opener/Stack
 * @author Герасимов А.М.
 * @private
 */
/*
 * Component that opens the popup with list, to the right of content area at the full height of the screen, from which you can select a value. {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/layout-selector-stack/ See more}.
 *
 * Here you can see <a href="/materials/Controls-demo/app/Engine-demo%2FSelector">demo-example</a>.
 *
 * @class Controls/_lookup/Opener
 * @control
 * @extends Controls/_popup/Opener/Stack
 * @author Gerasimov A.M.
 * @private
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


