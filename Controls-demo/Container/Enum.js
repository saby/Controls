/**
 * Created by kraynovdo on 26.04.2018.
 */
define('Controls-demo/Container/Enum',
   [
      'UI/Base',
      'wml!Controls-demo/Container/Enum',
      'Types/collection'
   ],

   function(Base, template, collection) {


      var EnumCont = Base.Control.extend({

         _template: template,
         _enumInst: null,

         constructor: function() {
            EnumCont.superclass.constructor.apply(this, arguments);
            this._enumInst = new collection.Enum({
               dictionary: ['Первый', 'Второй', 'Третий'],
               index: 1
            });
         },
         _changeIndex: function() {
            this._enumInst.set(2);
         }

      });

      return EnumCont;
   });
