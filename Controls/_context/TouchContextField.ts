/**
 * @class Controls/_context/TouchContextField
 * @deprecated
 * @private
 */

import DataContext = require('Core/DataContext');
import { TouchDetect } from 'Env/Touch';

class Context extends DataContext {
   _moduleName: string;
   isTouch: boolean;
   constructor(touch: boolean | object) {
      super();
      // todo: https://online.sbis.ru/opendoc.html?guid=e277e8e0-8617-41c9-842b-5c7dcb116e2c
      if (typeof touch === 'object') {
         this.isTouch = TouchDetect.getInstance().isTouch();
      } else {
         this.isTouch = touch;
      }
   }
   setIsTouch(touch: boolean): void {
      this.isTouch = touch;
      if (this.isTouch !== touch) {
         // Core/DataContext написан на js, в итоге с него не цепляются типы
         // tslint:disable-next-line:ban-ts-ignore
         // @ts-ignore
         this.updateConsumers();
      }
   }

   static create(): Context {
      const touchController = TouchDetect.getInstance();
      const touchContext = new Context(touchController.isTouch());
      touchController.subscribe('touchChanged', (event: Event, isTouch: boolean) => {
         touchContext.setIsTouch(isTouch);
      });
      return touchContext;
   }
}

Context.prototype._moduleName = 'Controls/_context/TouchContextField';

export default Context;
