define('Controls-demo/List/Grid/GridWithEditing', [
   'Env/Env',
   'Core/Control',
   'Controls-demo/List/Grid/GridWithEditingData',
   'wml!Controls-demo/List/Grid/GridWithEditing',
   'Types/source',
   'Core/core-clone',
   'Types/entity',
   'wml!Controls-demo/List/Tree/treeEditingTemplate',
   'wml!Controls-demo/List/Grid/DemoItem',
   'wml!Controls-demo/List/Grid/DemoBalancePrice',
   'wml!Controls-demo/List/Grid/DemoCostPrice',
   'wml!Controls-demo/List/Grid/DemoHeaderCostPrice',
   'Controls/scroll',
   'Controls/grid',
], function(Env, BaseControl, GridData, template, source, cClone, entity) {
   'use strict';
   var ModuleClass = BaseControl.extend({
      _template: template,
      _itemActions: null,
      _viewSource: null,
      gridColumns: null,
      gridHeader: null,
      showType: null,
      _itemId: 0,

      _beforeMount: function() {
         this.showType = {

            // show only in Menu
            MENU: 0,

            // show in Menu and Toolbar
            MENU_TOOLBAR: 1,

            // show only in Toolbar
            TOOLBAR: 2
         };
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
         this._viewSource = new source.Memory({
            keyProperty: 'id',
            data: cClone(GridData.catalog)
         });
         this.gridColumns = [
            {
               displayProperty: 'name',
               width: '1fr',
               compatibleWidth: '298px',
               template: 'wml!Controls-demo/List/Tree/treeEditingTemplate'
            },
            {
               displayProperty: 'price',
               width: 'auto',
               align: 'right',
               compatibleWidth: '39px',
               template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
            },
            {
               displayProperty: 'balance',
               width: 'auto',
               align: 'right',
               compatibleWidth: '62px',
               template: 'wml!Controls-demo/List/Grid/DemoBalancePrice'
            },
            {
               displayProperty: 'description',
               width: '1fr',
               compatibleWidth: '298px',
               align: 'right',
               template: 'wml!Controls-demo/List/Tree/treeEditingTemplate'
            },
            {
               displayProperty: 'costPrice',
               width: 'auto',
               align: 'right',
               compatibleWidth: '67px',
               template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
            },
            {
               displayProperty: 'balanceCostSumm',
               width: 'auto',
               compatibleWidth: '95px',
               align: 'right',
               template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
            }
         ];
         this.gridHeader = [
            {
               title: ''
            },
            {
               title: 'Цена',
               align: 'right'
            },
            {
               title: 'Остаток',
               align: 'right'
            },
            {
               title: 'Описание',
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
         ];
      },
      _beginAdd() {
         this._children.list.beginAdd({
            item: new entity.Model({
               keyProperty: 'id',
               rawData: {
                  'id': ++this._itemId,
                  'name': '',
                  'description': '',
                  'price': null,
                  'balance': null,
                  'balanceCostSumm': null,
                  'reserve': null,
                  'costPrice': 0
               }
            })
         });
      },
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
         Env.IoC.resolve('ILogger').info(arguments);
      }
   });

   ModuleClass._styles = ['Controls-demo/List/Grid/Grid'];

   return ModuleClass;
});
