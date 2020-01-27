/**
 * Context field for container options
 * @author Герасимов Александр
 * @deprecated
 * @class Controls/_context/ContextOptions
 * @private
 */

import DataContext = require('Core/DataContext');

const Context =  DataContext.extend({
   constructor: function(options) {
      for (var i in options) {
         if (options.hasOwnProperty(i)) {
            this[i] = options[i];
         }
      }
   },
   _moduleName: 'Controls/_context/ContextOptions'
});

export default Context;
