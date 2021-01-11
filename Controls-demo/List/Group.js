/**
 * Created by kraynovdo on 31.01.2018.
 */
define('Controls-demo/List/Group', [
   'UI/Base',
   'wml!Controls-demo/List/Group',
   'Controls/list',
   'Types/source',
   'wml!Controls-demo/List/DemoGroupTemplate'
], function (Base,
             template,
             ControlsConstants,
             source) {
   'use strict';
   var srcData = [
      {
         id: 1,
         title: 'Apple MacBook Pro MF839',
         brand: 'apple'
      },
      {
         id: 2,
         title: 'ASUS X751SA-TY124D',
         brand: 'asus'
      },
      {
         id: 3,
         title: 'HP 250 G5 (W4N28EA)',
         brand: 'hp'
      },
      {
         id: 4,
         title: 'ACER One 10 S1002-15GT',
         brand: 'acer'
      },
      {
         id: 5,
         title: 'ASUS X541SA-XO056D',
         brand: 'asus'
      },
      {
         id: 6,
         title: 'ACER Aspire F 15 F5-573G-51Q7',
         brand: 'acer'
      },
      {
         id: 7,
         title: 'HP 250 G5 (W4M56EA)',
         brand: 'hp'
      }
   ];

   var ModuleClass = Base.Control.extend(
      {
         _template: template,
         _dataLoadCallback: function(items) {
            items.setMetaData({
               groupResults: {
                  asus: '1555 руб. 00 коп.',
                  acer: '7777 руб. 00 коп.',
                  hp: '2318 руб. 55 коп.'
               }
            });
         },
         _groupingKeyCallback: function(item) {
            if (item.get('brand') === 'apple') {
               return ControlsConstants.groupConstants.hiddenGroup;
            }
            return item.get('brand');
         },

         constructor: function() {
            ModuleClass.superclass.constructor.apply(this, arguments);
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: srcData
            });
         }
      });
   return ModuleClass;
});
