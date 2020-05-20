define('Controls-demo/List/EditInPlace/Scenarios', [
   'Core/Control',
   'wml!Controls-demo/List/EditInPlace/Scenarios',
   'Types/source',
   'Types/entity',
   'wml!Controls-demo/List/EditInPlace/FirstScenario/Column',
   'wml!Controls-demo/List/Grid/DemoGroupTemplate',
   'wml!Controls-demo/List/EditInPlace/FirstScenario/Header',
   'wml!Controls-demo/List/EditInPlace/FirstScenario/HeaderButton',
   'wml!Controls-demo/List/EditInPlace/SecondScenario/Results',
   'wml!Controls-demo/List/EditInPlace/SecondScenario/FirstColumn',
   'wml!Controls-demo/List/EditInPlace/SecondScenario/SecondColumn',
   'wml!Controls-demo/List/EditInPlace/SecondScenario/Column',
   'wml!Controls-demo/List/EditInPlace/FourthScenario/Column',
   'wml!Controls-demo/List/EditInPlace/FifthScenario/Column',
   'wml!Controls-demo/List/EditInPlace/FifthScenario/SecondColumn',
   'wml!Controls-demo/List/EditInPlace/FifthScenario/Results',
], function(
   Control,
   template,
   sourceLib,
   entity
) {
   'use strict';

   var srcData = [
      {
         id: 1,
         name: 'Неисключительные права использования "СБИС++ ЭО-...',
         count: 2,
         units: 'шт',
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
         count: 2,
         units: 'шт',
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
         count: 2,
         units: 'ч',
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
         count: 1,
         units: 'шт',
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
         count: 10,
         units: 'уп',
         costPrice: 200,
         price: 350,
         NDS: 534,
         NDSP: 18,
         amount: 3500,
         type: 'goods'
      }
   ];

   var secondExampleLookupSource = new sourceLib.Memory({
      keyProperty: 'id',
      data: [
         {
            id: 0,
            title: 'Транспортные услуги сторонние',
            categoryNumber: '26',
            category: 'Общественные расходы',
            subdivision: '',
            subdivision2: ''
         },
         {
            id: 1,
            title: 'Канцелярия',
            categoryNumber: '26',
            category: 'Общественные расходы',
            subdivision: 'Администрация',
            subdivision2: ''
         },
         {
            id: 2,
            title: 'Канцелярия',
            categoryNumber: '26',
            category: 'Общественные расходы',
            subdivision: 'Администрация',
            subdivision2: ''
         },
         {
            id: 3,
            title: 'Банковское обслуживание',
            categoryNumber: '91-02',
            category: 'Прочие расходы',
            subdivision: 'Администрация',
            subdivision2: 'Прочие доходы'
         }
      ]
   });

   var srcData2 = [
      {
         id: 0,
         title: 'Транспортные услуги сторонние',
         comment: 'Грузовые линии',
         category: '26 Общественные расходы',
         subdivision: '',
         subdivision2: '',
         NDS: 458.14,
         percentage: 18,
         amount: 3200,
         source: secondExampleLookupSource,
         selectedKeys: [0]
      }, {
         id: 1,
         title: 'Канцелярия',
         comment: 'Бумага офисная А4 180г',
         category: '26 Общественные расходы',
         subdivision: 'Администрация',
         subdivision2: '',
         NDS: 500.11,
         percentage: 18,
         amount: 4800,
         source: secondExampleLookupSource,
         selectedKeys: [1]
      }, {
         id: 2,
         title: 'Канцелярия',
         comment: 'Коробка для бумаг/картон',
         category: '26 Общественные расходы',
         subdivision: 'Администрация',
         subdivision2: '',
         NDS: 221.11,
         percentage: 18,
         amount: 1200,
         source: secondExampleLookupSource,
         selectedKeys: [2]
      }, {
         id: 3,
         title: 'Банковское обслуживание',
         comment: 'август 2015',
         category: '91-02 Прочие расходы',
         subdivision: 'Администрация',
         subdivision2: 'Прочие доходы',
         NDS: 289.55,
         percentage: 18,
         amount: 2500,
         source: secondExampleLookupSource,
         selectedKeys: [3]
      }
   ];

   var srcData4 = [
      {
         id: 0,
         'Раздел': null,
         'Раздел@': true,
         title: 'Acer'
      }, {
         id: 1,
         'Раздел': null,
         'Раздел@': null,
         title: 'Ноутбук Packard Bell EasyNote T45453456',
         amount: 5,
         price: 12990,
         priceOpt: 10550
      }, {
         id: 2,
         'Раздел': null,
         'Раздел@': null,
         title: 'Ноутбук Lenovo IdeaPad G5030',
         amount: 4,
         price: 13665,
         priceOpt: 10360
      }
   ];

   var srcData5 = [
      {
         id: 0,
         date: '29.10.15',
         type: 'Входящий платеж',
         number: '№9',
         amount: '10 550.00'
      },
      {
         id: 1,
         date: '29.10.15',
         type: 'Входящий платеж',
         number: '№8',
         amount: '10 360.00'
      }
   ];

   var EIPScenarios = Control.extend({
      _template: template,
      editingConfig: null,
      _enabled: true,
      _showAddButton: true,

      _beforeMount: function() {
         this._itemActions = [{
            id: 1,
            icon: 'icon-View',
            title: 'view'
         },
         {
            id: 2,
            icon: 'icon-Erase',
            title: 'error',
            iconStyle: 'danger'
         }];

         this._viewSource = new sourceLib.Memory({
            keyProperty: 'id',
            data: srcData
         });
         this._viewSource2 = new sourceLib.Memory({
            keyProperty: 'id',
            data: srcData2
         });
         this._viewSource4 = new sourceLib.Memory({
            keyProperty: 'id',
            data: srcData4
         });
         this._viewSource5 = new sourceLib.Memory({
            keyProperty: 'id',
            data: srcData5
         });
         this._gridHeader = [
            {
               title: 'Наименование',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/HeaderButton'
            },
            {
               title: 'Кол-во',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Header'
            },
            {
               title: ''
            },
            {
               title: 'Себест.',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Header'
            },
            {
               title: 'Цена',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Header'
            },
            {
               title: 'НДС',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Header'
            },
            {
               title: '%',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Header'
            },
            {
               title: 'Сумма',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Header'
            }
         ];

         this._gridColumns = [
            {
               displayProperty: 'name',
               width: '390px',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Column'
            },
            {
               displayProperty: 'count',
               width: '60px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Column'
            },
            {
               displayProperty: 'units',
               width: '30px'
            },
            {
               displayProperty: 'costPrice',
               width: '105px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Column'
            },
            {
               displayProperty: 'price',
               width: '85px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Column'
            },
            {
               displayProperty: 'NDS',
               width: '75px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Column'
            },
            {
               displayProperty: 'NDSP',
               width: '40px',
               align: 'right'
            },
            {
               displayProperty: 'amount',
               width: '115px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Column'
            }
         ];

         this._gridHeader2 = [
            {
               title: 'Расходы',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/HeaderButton'
            },
            {
               title: ''
            },
            {
               title: ''
            },
            {
               title: ''
            },
            {
               title: ''
            }
         ];

         this._gridColumns2 = [
            {
               displayProperty: 'title',
               width: '380px',
               template: 'wml!Controls-demo/List/EditInPlace/SecondScenario/FirstColumn',
               resultTemplate: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Results'
            },
            {
               displayProperty: 'category',
               width: '280px',
               template: 'wml!Controls-demo/List/EditInPlace/SecondScenario/SecondColumn',
               resultTemplate: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Results'
            },
            {
               displayProperty: 'NDS',
               width: '70px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Column',
               resultTemplate: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Results',
               result: 1223.14
            },
            {
               displayProperty: 'percentage',
               width: '70px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Column',
               resultTemplate: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Results'
            },
            {
               displayProperty: 'amount',
               width: '100px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Column',
               resultTemplate: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Results',
               result: 10500
            }
         ];

         this._gridHeader4 = [
            {
               title: ''
            },
            {
               title: 'Кол-во, шт',
               align: 'right'
            },
            {
               title: 'Цена',
               align: 'right'
            },
            {
               title: 'Цена Опт',
               align: 'right'
            }
         ];

         this._gridColumns4 = [
            {
               displayProperty: 'title',
               width: '1fr'
            },
            {
               displayProperty: 'amount',
               width: '90px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FourthScenario/Column'
            },
            {
               displayProperty: 'price',
               width: '115px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FourthScenario/Column'
            },
            {
               displayProperty: 'priceOpt',
               width: '110px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FourthScenario/Column'
            }
         ];

         this._gridColumns5 = [
            {
               displayProperty: 'date',
               width: '80px',
               resultTemplate: 'wml!Controls-demo/List/EditInPlace/FifthScenario/Results'
            },
            {
               displayProperty: 'type',
               width: '150px',
               template: 'wml!Controls-demo/List/EditInPlace/FifthScenario/SecondColumn',
               resultTemplate: 'wml!Controls-demo/List/EditInPlace/FifthScenario/Results'
            },
            {
               displayProperty: 'number',
               width: '1fr',
               resultTemplate: 'wml!Controls-demo/List/EditInPlace/FifthScenario/Results'
            },
            {
               displayProperty: 'amount',
               width: '230px',
               align: 'right',
               template: 'wml!Controls-demo/List/EditInPlace/FifthScenario/Column',
               resultTemplate: 'wml!Controls-demo/List/EditInPlace/FifthScenario/Results',
               result: 20910
            }
         ];

         this._counter = 5;
      },

      _groupingKeyCallback: function(item) {
         return item.get('type');
      },

      _dataLoadCallback: function(items) {
         items.setMetaData({
            groupResults: {
               nonexclusive: 7000,
               works: 1400,
               goods: 93500
            }
         });
      },

      _onItemAdd: function(e, xz, isAdd) {
         if (isAdd) {
            return {
               item: new entity.Model({
                  rawData: {
                     id: ++this._counter,
                     title: '',
                     type: 'goods',
                     extraField: 'text'
                  }
               })
            };
         }
      },

      _toggleAddButton: function(e, state) {
         this._showAddButton = state;
      }
   });

   EIPScenarios._styles = ['Controls-demo/List/EditInPlace/Scenarios'];

   return EIPScenarios;
});
