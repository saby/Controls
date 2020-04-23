define('Controls-demo/List/Grid/Base', [
   'Env/Env',
   'Core/Control',
   'Controls-demo/List/Grid/GridData',
   'wml!Controls-demo/List/Grid/resources/Base/Base',
   'Types/source',
   'wml!Controls-demo/List/Grid/DemoItem',
   'wml!Controls-demo/List/Grid/DemoBalancePrice',
   'wml!Controls-demo/List/Grid/DemoCostPrice',
   'wml!Controls-demo/List/Grid/DemoHeaderCostPrice',
   'wml!Controls-demo/List/Grid/DemoName',
   'Controls/scroll',
   'Controls/grid',
], function(Env, BaseControl, GridData, template, source) {
   'use strict';
   var
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
      fullColumns = [
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
         },
         {
            displayProperty: 'balance',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoBalancePrice'
         },
         {
            displayProperty: 'reserve',
            width: 'auto',
            align: 'right'
         },
         {
            displayProperty: 'costPrice',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
         },
         {
            displayProperty: 'balanceCostSumm',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
         }
      ],
      partialHeader = [
         {
            title: ''
         },
         {
            title: 'Цена',
            align: 'right'
         }
      ],
      fullHeader = [
         {
            title: ''
         },
         {
            title: 'Цена',
            align: 'right'
         },
         {
            title: 'Остаток',
            align: 'right',
            sortingProperty: 'balance'
         },
         {
            title: 'Резерв',
            align: 'right'
         },
         {
            title: 'Себест.',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoHeaderCostPrice'
         },
         {
            title: 'Сумма остатка',
            align: 'right'
         }
      ],
      ModuleClass = BaseControl.extend({
         _template: template,
         _styles: ['Controls-demo/List/Grid/Grid', 'Controls-demo/List/Grid/resources/Base/Base'],
         _actionClicked: '',
         _fullSet: true,
         _itemActions: null,
         _viewSource: null,
         _sorting: [],
         gridColumns: null,
         gridHeader: null,
         showType: null,
         _showAction: function(action, item) {
            if (item.get('id') === '471329') {
               if (action.id === 2 || action.id === 3) {
                  return false;
               }
               return true;
            }
            if (action.id === 5) {
               return false;
            }
            if (item.get('id') === '448390') {
               return false;
            }

            return true;
         },
         _onActionClick: function(event, action, item) {
            this._actionClicked = action.title;
         },
         _beforeMount: function() {
            this._firstSelectedKeys = ['448390'];
            this._secondSelectedKeys = ['448390'];
            this.showType = {

               // show only in Menu
               MENU: 0,

               // show in Menu and Toolbar
               MENU_TOOLBAR: 1,

               // show only in Toolbar
               TOOLBAR: 2
            };
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: GridData.catalog
            });
            this._itemActions = [
               {
                  id: 5,
                  title: 'прочитано',
                  showType: this.showType.TOOLBAR,
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
                  showType: this.showType.MENU_TOOLBAR,
                  handler: function() {
                     Env.IoC.resolve('ILogger').info('action profile Click');
                  }
               },
               {
                  id: 4,
                  icon: 'icon-Erase icon-error',
                  title: 'delete pls',
                  showType: this.showType.TOOLBAR,
                  handler: function() {
                     Env.IoC.resolve('ILogger').info('action delete Click');
                  }
               }
            ];
            this.gridColumns = fullColumns;
            this.gridHeader = fullHeader;
         },
         _onToggleColumnsClicked: function() {
            this._fullSet = !this._fullSet;
            this.gridColumns = this._fullSet ? fullColumns : partialColumns;
            this.gridHeader = this._fullSet ? fullHeader : partialHeader;
            this._forceUpdate();
         }
      });

   return ModuleClass;
});
