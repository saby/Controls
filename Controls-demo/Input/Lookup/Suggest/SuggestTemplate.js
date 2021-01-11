define('Controls-demo/Input/Lookup/Suggest/SuggestTemplate', [
   'UI/Base',
   'wml!Controls-demo/Input/Lookup/Suggest/SuggestTemplate',
   'Controls/list'
], function(Base, template) {
   
   'use strict';
   
   return Base.Control.extend({
      _template: template
   });
   
});