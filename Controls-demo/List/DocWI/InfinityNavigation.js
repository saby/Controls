define('Controls-demo/List/DocWI/InfinityNavigation', [
   'UI/Base',
   'wml!Controls-demo/List/DocWI/resources/InfinityNavigation',
   'Types/source'
], function (Base, template, sourceLib) {
   'use strict';

   var srcData = [
      {
         id: 1,
         title: 'Prague'
      },
      {
         id: 2,
         title: 'Moscow'
      },
      {
         id: 3,
         title: 'London'
      },
      {
         id: 4,
         title: 'Jakarta'
      },
      {
         id: 5,
         title: 'Accra'
      },
      {
         id: 6,
         title: 'Baghdad'
      },
      {
         id: 7,
         title: 'Abidjan'
      },
      {
         id: 8,
         title: 'Tokyo'
      },
      {
         id: 9,
         title: 'Astana'
      },
      {
         id: 10,
         title: 'Rabat'
      },
      {
         id: 11,
         title: 'Oslo'
      },
      {
         id: 12,
         title: 'Muscat'
      },
      {
         id: 13,
         title: 'Singapore City'
      },
      {
         id: 14,
         title: 'Colombo'
      },
      {
         id: 15,
         title: 'Abu Dhabi'
      },
      {
         id: 16,
         title: 'Tashkent'
      },
      {
         id: 17,
         title: 'Baku'
      },
      {
         id: 18,
         title: 'Nassau'
      },
      {
         id: 19,
         title: 'Manama'
      },
      {
         id: 20,
         title: 'Copenhagen'
      },
      {
         id: 21,
         title: 'Cairo'
      },
      {
         id: 22,
         title: 'Paris'
      },
      {
         id: 23,
         title: 'Tbilisi'
      },
      {
         id: 24,
         title: 'Berlin'
      },
      {
         id: 25,
         title: 'Dushanbe'
      },
      {
         id: 26,
         title: 'Lome'
      },
      {
         id: 27,
         title: 'Tunis'
      },
      {
         id: 28,
         title: 'Ashgabat'
      },
      {
         id: 29,
         title: 'Kampala'
      },
      {
         id: 30,
         title: 'Kiev'
      },
      {
         id: 31,
         title: 'Washington'
      },
      {
         id: 32,
         title: 'Montevideo'
      },
      {
         id: 33,
         title: 'Sana\'a'
      },
      {
         id: 34,
         title: 'Kinshasa'
      },
      {
         id: 35,
         title: 'Lusaka'
      },
      {
         id: 36,
         title: 'Harare'
      }
   ];

   var Module = Base.Control.extend(
      {
         _template: template,
         _viewSource: null,

         _beforeMount: function(newOptions) {
            this._viewSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: srcData
            });
         }
      });
   return Module;
});
