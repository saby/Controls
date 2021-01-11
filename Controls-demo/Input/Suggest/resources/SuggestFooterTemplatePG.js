define('Controls-demo/Input/Suggest/resources/SuggestFooterTemplatePG', [
   'UI/Base',
   'wml!Controls-demo/Input/Suggest/resources/SuggestFooterTemplatePG',
   'Controls/buttons',
], function(Base, template) {
   'use strict';
   
   var ModuleClass = Base.Control.extend({
      _template: template,
      _caption: 'custom footer button',
      _click: function() {
         this._caption = 'Thank you for click';
      }
   });

   ModuleClass._styles = ['Controls-demo/Input/Suggest/resources/SuggestFooterTemplatePG'];

   return ModuleClass;
});
