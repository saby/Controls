define('Controls-demo/Wrapper/ObjectEditor',
   [
      'UI/Base',
      'wml!Controls-demo/Wrapper/ObjectEditor'

   ],
   function(Base, template) {


      var ObjectEditor = Base.Control.extend({

         _template: template,
         _objectValueChanged: function(ev, name, value) {
            this._options.value[name] = value;
         }

      });

      return ObjectEditor;

   });
