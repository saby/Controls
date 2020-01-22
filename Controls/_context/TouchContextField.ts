/**
 * @class Controls/_context/TouchContextField
 * @deprecated
 * @private
 */

import DataContext = require('Core/DataContext');
import {compatibility} from 'Env/Env';

const Context = DataContext.extend({
   isTouch: null,
   _moduleName: 'Controls/_context/TouchContextField',
   constructor: function(touch) {
      // todo: https://online.sbis.ru/opendoc.html?guid=e277e8e0-8617-41c9-842b-5c7dcb116e2c
      if (typeof touch === 'object') {
         touch = compatibility.touch;
      }
      this.isTouch = touch;
   },
   setIsTouch: function(touch) {
      this.isTouch = touch;
      this.updateConsumers();
   }
});

export default Context;
