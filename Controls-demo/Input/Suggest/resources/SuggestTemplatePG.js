define('Controls-demo/Input/Suggest/resources/SuggestTemplatePG', [
   'UI/Base',
   'wml!Controls-demo/Input/Suggest/resources/SuggestTemplatePG',
   'Controls/list',
   'Controls/suggestPopup',
   'wml!Controls-demo/Input/Suggest/resources/CustomTemplatePG'
], function(Base, template) {
   'use strict';
   
   return Base.Control.extend({
      _template: template
   });
});
