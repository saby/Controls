define('Controls-demo/Wrapper/Wrapper',
   [
      'UI/Base',
      'wml!Controls-demo/Wrapper/Wrapper'

   ],
   function(Base, template) {


      var Wrapper = Base.Control.extend({

         _template: template

      });

      return Wrapper;

   });
