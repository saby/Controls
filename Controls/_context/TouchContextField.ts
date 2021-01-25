/**
 * @class Controls/_context/TouchContextField
 * @deprecated
 * @private
 */

import DataContext = require('Core/DataContext');
import { TouchDetect } from 'Env/Touch';

const Context = DataContext.extend({
   isTouch: null,
   _moduleName: 'Controls/_context/TouchContextField',
   constructor: function (touch) {
      // todo: https://online.sbis.ru/opendoc.html?guid=e277e8e0-8617-41c9-842b-5c7dcb116e2c
      if (typeof touch === 'object') {
         touch = TouchDetect.getInstance().isTouch();
      }
      this.isTouch = touch;
   },
   setIsTouch: function (touch) {
      this.isTouch = touch;
      if (this.isTouch !== touch) {
         this.updateConsumers();
      }
   }
});
Context.create = function () {
   const touchController = TouchDetect.getInstance();
   const touchContext = new Context(touchController.isTouch());
   touchController.subscribe('touchChanged', (event: Event, isTouch: boolean) => {
      touchContext.setIsTouch(isTouch);
   });
   return touchContext;
}

export default Context;
