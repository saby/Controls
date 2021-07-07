/**
 * Context field for container options
 * @author Герасимов Александр
 * @deprecated
 * @class Controls/_context/ContextOptions
 * @private
 */

import DataContext = require('Core/DataContext');
import {IControlerState} from 'Controls/_dataSource/Controller';

const Context =  DataContext.extend({
   constructor: function(options: IControlerState) {
      for (let i in options) {
         if (options.hasOwnProperty(i)) {
            this[i] = options[i];
         }
      }
   },
   _moduleName: 'Controls/_context/ContextOptions'
});

export default Context;
