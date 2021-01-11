define('Controls-demo/Suggest/resources/EmptyTemplate', [
   'UI/Base',
   'wml!Controls-demo/Suggest/resources/EmptyTemplate'
], function(Base, template) {
   return Base.Control.extend({
      _template: template
   });
});