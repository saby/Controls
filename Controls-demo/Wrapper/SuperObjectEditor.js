define('Controls-demo/Wrapper/SuperObjectEditor',
   [
      'UI/Base',
      'wml!Controls-demo/Wrapper/SuperObjectEditor'

   ],
   function(Base, template) {


      var SuperObjectEditor = Base.Control.extend({

         _template: template,
         _myFun: function(opt) {

            for (var i in opt.value) {
               if (opt.value.hasOwnProperty(i)) {
                  switch (typeof opt.value[i]) {
                     case 'string':
                        this.map.push({fieldName: i, editor: opt.stringEditor});
                        break;
                     case 'number':
                        this.map.push({fieldName: i, editor: opt.numberEditor});
                        break;
                     case 'object':
                        this.map.push({fieldName: i, editor: SuperObjectEditor});
                        break;
                  }
               }
            }
         },
         _beforeMount: function(options) {
            this.map = [];
            this._myFun(options);

         }


      });

      return SuperObjectEditor;

   });
