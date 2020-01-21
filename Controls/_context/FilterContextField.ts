/**
 * @class Controls/_context/FilterContextField
 * @deprecated
 * @private
 */

import DataContext = require('Core/DataContext');

const Context =  DataContext.extend({
   filter: null,
   filterButtonItems: null,
   fastFilterItems: null,
   historyId: null,

   constructor: function(cfg) {
      this.filter = cfg.filter;
      this.filterButtonItems = cfg.filterButtonItems;
      this.fastFilterItems = cfg.fastFilterItems;
      this.historyId = cfg.historyId;
   },
   _moduleName: 'Controls/_context/FilterContextField'
});

export default Context;
