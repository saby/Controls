define('Controls-demo/progress/Barfortest', [
   'UI/Base',
   'wml!Controls-demo/progress/Barfortest',
], function(Base, template) {

   var Index = Base.Control.extend(
      {
         _template: template

      });




   Index._styles = ['Controls-demo/progress/Barfortest'];

   return Index;
});
