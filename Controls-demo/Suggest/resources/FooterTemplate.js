define('Controls-demo/Suggest/resources/FooterTemplate', [
   'UI/Base',
   'wml!Controls-demo/Suggest/resources/FooterTemplate'
], function(Base, template) {
   return Base.Control.extend({
      _template: template
   });
});