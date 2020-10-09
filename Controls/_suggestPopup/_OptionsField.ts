/**
 * Context field for Suggest options
 */
import DataContext = require('Core/DataContext');

export = DataContext.extend({
   _moduleName: "Controls/_suggestPopup/_OptionsField",
   constructor: function(options) {
      this.options = options;
   }
});
