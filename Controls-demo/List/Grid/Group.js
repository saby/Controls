define('Controls-demo/List/Grid/Group', [
   'UI/Base',
   'wml!Controls-demo/List/Grid/Group',
   'Types/source',
   'wml!Controls-demo/List/Grid/DemoGroupTemplate',
   'wml!Controls-demo/List/Grid/DemoGroupColumnTemplate',
   'Controls/decorator',
   'Controls/list',
   'wml!Controls-demo/List/Grid/DemoGroupHeaderTemplate'
], function (Base, template, source) {
   'use strict';
   var
      ModuleClass = Base.Control.extend({

         _template: template,

         _dataLoadCallback: function(items) {
            items.setMetaData({
               groupResults: {
                  nonexclusive: 7000,
                  works: 1400,
                  goods: 93500
               }
            });
         },

         _viewSource: new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: 1,
                  name: 'Неисключительные права использования "СБИС++ ЭО-...',
                  count: '2 шт',
                  costPrice: 1000,
                  price: 1500,
                  NDS: 458,
                  NDSP: 18,
                  amount: 3000,
                  type: 'nonexclusive'
               },
               {
                  id: 2,
                  name: 'Неисключительные права использования возможности ...',
                  count: '2 шт',
                  costPrice: 1600,
                  price: 2000,
                  NDS: 610,
                  NDSP: 10,
                  amount: 4000,
                  type: 'nonexclusive'
               },
               {
                  id: 3,
                  name: 'Работа специалиста отдела "Электронная отчётность" ...',
                  count: '2 ч',
                  costPrice: 600,
                  price: 700,
                  NDS: 214,
                  NDSP: 18,
                  amount: 1400,
                  type: 'works'
               },
               {
                  id: 4,
                  name: 'Сервер GL2500/4UT8G2 С предустановленной системой',
                  count: '1 шт',
                  costPrice: 80000,
                  price: 90000,
                  NDS: 13729,
                  NDSP: 10,
                  amount: 90000,
                  type: 'goods'
               },
               {
                  id: 5,
                  name: 'Устройство хранения USB с чехлом',
                  count: '10 уп',
                  costPrice: 200,
                  price: 350,
                  NDS: 534,
                  NDSP: 18,
                  amount: 3500,
                  type: 'goods'
               }
            ]
         }),

         _groupingKeyCallback: function(item) {
            return item.get('type');
         },
         _gridColumns: [
            {
               displayProperty: 'name',
               width: '1fr',
               template: 'wml!Controls-demo/List/Grid/DemoGroupColumnTemplate'
            },
            {
               displayProperty: 'count',
               width: '50px',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoGroupColumnTemplate'
            },
            {
               displayProperty: 'costPrice',
               width: '75px',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoGroupColumnTemplate'
            },
            {
               displayProperty: 'price',
               width: '75px',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoGroupColumnTemplate'
            },
            {
               displayProperty: 'NDS',
               width: '75px',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoGroupColumnTemplate'
            },
            {
               displayProperty: 'NDSP',
               width: '25px',
               template: 'wml!Controls-demo/List/Grid/DemoGroupColumnTemplate'
            },
            {
               displayProperty: 'amount',
               width: '75px',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoGroupColumnTemplate'
            }
         ],
         _gridHeader: [
            {
               title: ''
            },
            {
               title: 'Кол-во',
               align: 'right'
            },
            {
               title: 'Себест.',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoGroupHeaderTemplate'
            },
            {
               title: 'Цена',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoGroupHeaderTemplate'
            },
            {
               title: 'НДС',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoGroupHeaderTemplate'
            },
            {
               title: '%',
               align: 'right'
            },
            {
               title: 'Сумма',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoGroupHeaderTemplate'
            }
         ]
      });

   return ModuleClass;
});
