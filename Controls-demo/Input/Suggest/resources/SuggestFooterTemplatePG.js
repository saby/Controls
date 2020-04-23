define('Controls-demo/Input/Suggest/resources/SuggestFooterTemplatePG', [
   'Core/Control',
   'wml!Controls-demo/Input/Suggest/resources/SuggestFooterTemplatePG',
   'Controls/buttons',
], function(Control, template) {
   'use strict';
   
   return Control.extend({
      _template: template,
      _styles: ['Controls-demo/Input/Suggest/resources/SuggestFooterTemplatePG'],
      _caption: 'custom footer button',
      _click: function() {
         this._caption = 'Thank you for click';
      }
   });
});
