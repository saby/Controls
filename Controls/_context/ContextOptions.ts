/**
 * Context field for container options
 * @author Герасимов Александр
 * @deprecated
 * @class Controls/_context/ContextOptions
 * @private
 */

import * as DataContext from 'Core/DataContext';
import {IControllerState} from 'Controls/_dataSource/Controller';

const Context =  DataContext.extend({
   constructor(options: IControllerState): void {
      for (const i in options) {
         if (options.hasOwnProperty(i)) {
            this[i] = options[i];
         }
      }
   },
   _moduleName: 'Controls/_context/ContextOptions'
});

export default Context;
