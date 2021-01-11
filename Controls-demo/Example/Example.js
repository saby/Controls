define('Controls-demo/Example/Example',
   [
      'UI/Base',
      'wml!Controls-demo/Example/Example'
   ],
   function(Base, template) {

      'use strict';

      var data = [
         {name: 'Input/Area', title: 'Area'},
         {name: 'Input/Font', title: 'Font'},
         {name: 'Input/Mask', title: 'Mask'},
         {name: 'Input/Number', title: 'Number'},
         {name: 'Input/Password', title: 'Password'},
         {name: 'Input/Phone', title: 'Phone'},
         {name: 'Input/PositionLabels', title: 'PositionLabels'},
         {name: 'Input/Suggest', title: 'Suggest'},
         {name: 'Input/Tag', title: 'Tag'},
         {name: 'Input/Text', title: 'Text'}
      ];

      var Example = Base.Control.extend({
         _template: template,

         _href: null,

         _data: null,

         _beforeMount: function() {
            this._data = data;
            this._href = location.origin + location.pathname;
         }
      });

      return Example;
   }
);
