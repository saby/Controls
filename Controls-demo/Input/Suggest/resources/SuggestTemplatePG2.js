define('Controls-demo/Input/Suggest/resources/SuggestTemplatePG2', [
   'UI/Base',
   'wml!Controls-demo/Input/Suggest/resources/SuggestTemplatePG2',
   'Controls/list',
   'wml!Controls-demo/Input/Suggest/resources/CustomTemplatePG2'
], function(Base, template) {
   'use strict';
   
   return Base.Control.extend({
      _template: template
   });
});
