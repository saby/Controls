define('Controls-demo/List/Grid/ColumnScroll', [
   'Core/Control',
   'Controls-demo/List/Grid/GridData',
   'wml!Controls-demo/List/Grid/ColumnScroll',
   'Types/source',
   'Controls/Utils/Toolbar',
   'wml!Controls-demo/List/Grid/DemoItem',
   'wml!Controls-demo/List/Grid/DemoBalancePrice',
   'wml!Controls-demo/List/Grid/DemoCostPrice',
   'wml!Controls-demo/List/Grid/DemoHeaderCostPrice',
   'wml!Controls-demo/List/Grid/DemoName',
   'Controls/scroll',
   'Controls/grid',
   'wml!Controls-demo/List/Grid/Results'
], function(BaseControl, GridData, template, source, Toolbar) {
   'use strict';
   var
      columns = [
         {
            displayProperty: 'name',
            width: 'minmax(600px, 1fr)',
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
            displayProperty: 'costPrice',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: '330.56'
         },
         {
            displayProperty: 'costPrice1',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: '1330.56'
         },
         {
            displayProperty: 'costPrice2',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: '2330.56'
         },
         {
            displayProperty: 'costPrice3',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: '3330.56'
         },
         {
            displayProperty: 'costPrice4',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: '4330.56'
         },
         {
            displayProperty: 'costPrice5',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: '5330.56'
         },
         {
            displayProperty: 'costPrice6',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: '6330.56'
         },
         {
            displayProperty: 'costPrice7',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: '7330.56'
         },
         {
            displayProperty: 'costPrice8',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: '8330.56'
         },
         {
            displayProperty: 'costPrice9',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: '9330.56'
         },
         {
            displayProperty: 'balanceCostSumm',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: '7890.12'
         }
      ],
      header = [
         { title: 'Title' },
         { title: 'Price' },
         { title: 'Balance' },
         { title: 'Cost price' },
         { title: 'Price #2' },
         { title: 'Price #3' },
         { title: 'Price #4' },
         { title: 'Price #5' },
         { title: 'Price #6' },
         { title: 'Price #7' },
         { title: 'Price #8' },
         { title: 'Price #9' },
         { title: 'Price #10' },
         { title: 'Cost sum' }
      ],
      itemActions = [
         {
            id: 1,
            icon: 'icon-EmptyMessage icon-primary',
            title: 'message',
            showType: Toolbar.showType.TOOLBAR,
            handler: function() {
               alert('Message click');
            }
         },
         {
            id: 2,
            icon: 'icon-Erase icon-error',
            title: 'delete',
            showType: Toolbar.showType.TOOLBAR,
            handler: function() {
               alert('Delete click');
            }
         }
      ],

      ModuleClass = BaseControl.extend({
         _template: template,
         _viewSource: null,
         _gridHeader: null,
         _gridColumns: null,
         _itemActions: null,
         _stickyColumnsCount: 1,
         _beforeMount: function() {
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: GridData.catalog
            });
            this._gridColumns = columns;
            this._gridHeader = header;
            this._itemActions = itemActions;
         }
      });

   ModuleClass._styles = ['Controls-demo/List/Grid/Grid'];

   return ModuleClass;
});
