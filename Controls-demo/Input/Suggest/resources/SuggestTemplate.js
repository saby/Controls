define('Controls-demo/Input/Suggest/resources/SuggestTemplate', [
   'UI/Base',
   'wml!Controls-demo/Input/Suggest/resources/SuggestTemplate',
   'wml!Controls-demo/Input/Suggest/resources/CustomTemplate',
   'Controls/list'
], function(Base, template, custom, lists) {
   'use strict';

   return Base.Control.extend({
      _template: template,
      _custom: custom,
      _def: lists.ItemTemplate,
      _gl: true
   });
});
