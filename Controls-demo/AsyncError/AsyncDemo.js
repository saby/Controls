define('Controls-demo/AsyncError/AsyncDemo', [
   'UI/Base',
   'wml!Controls-demo/AsyncError/AsyncDemo'
], function(Base, template) {

   var AsyncDemo = Base.Control.extend({
      _template: template
   });

   return AsyncDemo;
});
