define('Controls-demo/List/NoScrollPaging', [
   'Env/Env',
   'Core/Control',
   'Controls-demo/List/Grid/GridData',
   'wml!Controls-demo/List/NoScrollPaging/NoScrollPaging',
   'Types/source',
   'Controls/Utils/Toolbar',
   'wml!Controls-demo/List/Grid/DemoItem',
   'wml!Controls-demo/List/Grid/DemoCostPrice',
   'wml!Controls-demo/List/Grid/DemoName'
], function (Env, BaseControl,
             GridData,
             template,
             source,
             Toolbar
) {
   'use strict';

   var srcData = [
      {
         id: 1,
         title: 'Настолько длинное название папки что оно не влезет в максимальный размер 1'
      },
      {
         id: 2,
         title: 'Notebooks 2'
      },
      {
         id: 3,
         title: 'Smartphones 3 '
      },
      {
         id: 4,
         title: 'Notebook Lenovo G505 59426068 4'
      },
      {
         id: 5,
         title: 'Notebook Packard Bell EasyNote TE69HW-29572G32 5'
      },
      {
         id: 6,
         title: 'Notebook ASUS X550LC-XO228H 6'
      },
      {
         id: 7,
         title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 7'
      },
      {
         id: 8,
         title: 'Notebook Lenovo G505 59426068 8'
      },
      {
         id: 9,
         title: 'Lenovo 9'
      },
      {
         id: 11,
         title: 'Настолько длинное название папки что оно не влезет в максимальный размер 11'
      },
      {
         id: 12,
         title: 'Notebooks 12'
      },
      {
         id: 13,
         title: 'Smartphones 13'
      },
      {
         id: 14,
         title: 'Notebook Lenovo G505 59426068 14'
      },
      {
         id: 15,
         title: 'Notebook Packard Bell EasyNote TE69HW-29572G32 15'
      },
      {
         id: 16,
         title: 'Notebook ASUS X550LC-XO228H 16'
      },
      {
         id: 17,
         title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 17'
      },
      {
         id: 18,
         title: 'Notebook Lenovo G505 59426068 18'
      },
      {
         id: 19,
         title: 'Lenovo 19'
      },
      {
         id: 21,
         title: 'Настолько длинное название папки что оно не влезет в максимальный размер 21'
      },
      {
         id: 22,
         title: 'Notebooks 22'
      },
      {
         id: 23,
         title: 'Smartphones 23'
      },
      {
         id: 24,
         title: 'Notebook Lenovo G505 59426068 24'
      },
      {
         id: 25,
         title: 'Notebook Packard Bell EasyNote TE69HW-29572G32 25'
      },
      {
         id: 26,
         title: 'Notebook ASUS X550LC-XO228H 26'
      },
      {
         id: 27,
         title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 27'
      },
      {
         id: 28,
         title: 'Notebook Lenovo G505 59426068 28'
      },
      {
         id: 29,
         title: 'Lenovo 29'
      },
      {
         id: 31,
         title: 'Настолько длинное название папки что оно не влезет в максимальный размер 31'
      },
      {
         id: 32,
         title: 'Notebooks 32'
      },
      {
         id: 33,
         title: 'Smartphones 33 '
      },
      {
         id: 34,
         title: 'Notebook Lenovo G505 59426068 34'
      },
      {
         id: 35,
         title: 'Notebook Packard Bell EasyNote TE69HW-29572G32 35'
      },
      {
         id: 36,
         title: 'Notebook ASUS X550LC-XO228H 36'
      },
      {
         id: 37,
         title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 37'
      },
      {
         id: 38,
         title: 'Notebook Lenovo G505 59426068 38'
      },
      {
         id: 39,
         title: 'Lenovo 39'
      },
      {
         id: 41,
         title: 'Настолько длинное название папки что оно не влезет в максимальный размер 41'
      },
      {
         id: 42,
         title: 'Notebooks 42'
      },
      {
         id: 43,
         title: 'Smartphones 43'
      },
      {
         id: 44,
         title: 'Notebook Lenovo G505 59426068 44'
      },
      {
         id: 45,
         title: 'Notebook Packard Bell EasyNote TE69HW-29572G32 45'
      },
      {
         id: 46,
         title: 'Notebook ASUS X550LC-XO228H 46'
      },
      {
         id: 47,
         title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 47'
      },
      {
         id: 48,
         title: 'Notebook Lenovo G505 59426068 48'
      },
      {
         id: 49,
         title: 'Lenovo 49'
      },
      {
         id: 51,
         title: 'Настолько длинное название папки что оно не влезет в максимальный размер 51'
      },
      {
         id: 52,
         title: 'Notebooks 52'
      },
      {
         id: 53,
         title: 'Smartphones 53'
      },
      {
         id: 54,
         title: 'Notebook Lenovo G505 59426068 54'
      },
      {
         id: 55,
         title: 'Notebook Packard Bell EasyNote TE69HW-29572G32 55'
      },
      {
         id: 56,
         title: 'Notebook ASUS X550LC-XO228H 56'
      },
      {
         id: 57,
         title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 57'
      },
      {
         id: 58,
         title: 'Notebook Lenovo G505 59426068 58'
      },
      {
         id: 59,
         title: 'Lenovo 59'
      }
   ],
      partialColumns = [
         {
            displayProperty: 'name',
            width: '1fr',
            template: 'wml!Controls-demo/List/Grid/DemoName'
         },
         {
            displayProperty: 'price',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
         }
      ],
      partialColumns2 = [
         {
            displayProperty: 'name',
            width: '1fr',
            template: 'wml!Controls-demo/List/Grid/DemoName'
         },
         {
            displayProperty: 'costPrice',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
         }
      ];

   var mySource = source.Memory.extend({
      query: function(query) {
         return mySource.superclass.query.apply(this, arguments);
      }
   });
   var ModuleClass = BaseControl.extend(
      {
         _template: template,
         _styles: ['Controls-demo/List/NoScrollPaging/NoScrollPaging'],
         _footerPagingOptions: null,
         _footerPagingOptionsG: null,
         _selectKeyColumn: null,
         _columnSource: null,
         _itemActions: null,
         _markedKey: 0,
         _markedKeyG: 0,
         gridColumns2: null,
         constructor: function() {
            ModuleClass.superclass.constructor.apply(this, arguments);
            this._itemActions = [
               {
                  id: 5,
                  title: 'прочитано',
                  showType: Toolbar.showType.TOOLBAR,
                  handler: function() {
                     Env.IoC.resolve('ILogger').info('action read Click');
                  }
               },
               {
                  id: 1,
                  icon: 'icon-primary icon-PhoneNull',
                  title: 'phone',
                  handler: function(item) {
                     Env.IoC.resolve('ILogger').info('action phone Click ', item);
                  }
               },
               {
                  id: 2,
                  icon: 'icon-primary icon-EmptyMessage',
                  title: 'message',
                  handler: function() {
                     alert('Message Click');
                  }
               },
               {
                  id: 3,
                  icon: 'icon-primary icon-Profile',
                  title: 'profile',
                  showType: Toolbar.showType.TOOLBAR,
                  handler: function() {
                     Env.IoC.resolve('ILogger').info('action profile Click');
                  }
               },
               {
                  id: 4,
                  icon: 'icon-Erase icon-error',
                  title: 'delete pls',
                  showType: Toolbar.showType.TOOLBAR,
                  handler: function() {
                     Env.IoC.resolve('ILogger').info('action delete Click');
                  }
               }
            ];
            this._viewSource = new mySource({
               keyProperty: 'id',
               data: srcData
            });
            this._viewSourceG = new source.Memory({
               keyProperty: 'id',
               data: GridData.catalog
            });
            this._columnSource = new source.Memory({
               data: [
                  { key: 'price', title: 'Цена' },
                  { key: 'costPrice', title: 'Себестоимость' }
               ],
               keyProperty: 'key'
            });
            this.gridColumns2 = partialColumns;
            this._selectKeyColumn = ['price'];
         },
         _onMoreClick: function() {
            this._children.psina.__loadPage('down');
         },

         _selectedKeysChangeColumn: function(event, field) {
            this.gridColumns2 = field[0] === 'price' ? partialColumns : partialColumns2;
         }
      });
   return ModuleClass;
});
