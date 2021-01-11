define('Controls-demo/FilterButton/FilterButton',
   [
      'UI/Base',
      'wml!Controls-demo/FilterButton/FilterButton',
      'Controls/filter',
      'Controls/buttons',
      'Types/source'
   ],

   function(Base, template) {
      'use strict';
      var FilterButton = Base.Control.extend({

         _template: template,
         sourceDropdown: null,
         _beforeMount: function() {
            this.sourceDropdown = {
               module: 'Types/source:Memory',
               options: {
                  data: [
                     { key: 1, title: 'все страны' },
                     { key: 2, title: 'Россия' },
                     { key: 3, title: 'США' },
                     { key: 4, title: 'Великобритания' }
                  ],
                  keyProperty: 'key'
               }
            };
         }

      });

      return FilterButton;
   });
