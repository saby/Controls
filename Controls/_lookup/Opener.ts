import Control = require('Core/Control');
import {Stack as StackOpener} from 'Controls/popup';

/**
 * Контрол, который открывает всплывающее окно со списком, располагающимся справа от контентной области на всю высоту экрана, из которого можно выбрать значение.
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/layout-selector-stack/ Подробнее}.
 *
 * Здесь вы можете увидеть <a href="/materials/Controls-demo/app/Engine-demo%2FSelector">демонстрационный пример</a>.
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

   open: function (cfg) {
      return StackOpener.openPopup(cfg || {}).then((popupId) => {
         this._popupId = popupId;
      });
   },

   close: function () {
      return StackOpener.closePopup(this._popupId);
   }

});

export = SelectorOpener;


