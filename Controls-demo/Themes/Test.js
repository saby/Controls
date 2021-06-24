define('Controls-demo/Themes/Test',
   [
      'UI/Base',
      'wml!Controls-demo/Themes/Test'
   ],
   function(Base, template) {

      'use strict';

      var Label = Base.Control.extend({
         _template: template,
         _doBut: false,
         theme1: '',
         theme2: '',

         doReqList: function(event) {
            this._doBut = true;
            require(['Controls/list']);
         },

         changeTheme: function(e){
            var thms = [];
            if (this.theme1) {
               thms.push(this.theme1);
            }
            if (this.theme2) {
               thms.push(this.theme2);
            }
            this._notify('themeChanged', [ thms ], {bubbling:true});
         }

      });

      return Label;
   }
);