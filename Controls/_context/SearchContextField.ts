/**
 * @class Controls/_context/SearchContextField
 * @deprecated
 * @private
 */

import DataContext = require('Core/DataContext');

const Context =  DataContext.extend({
   searchValue: '',

   constructor: function(searchValue) {
      this.searchValue = searchValue;
   },
   _moduleName: 'Controls/_context/SearchContextField'
});

export default Context;
