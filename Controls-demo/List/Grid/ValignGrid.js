define('Controls-demo/List/Grid/ValignGrid', [
   'Core/Control',
   'wml!Controls-demo/List/Grid/ValignGrid',
   'Types/source',
   'wml!Controls-demo/List/Grid/DemoItem',
   'wml!Controls-demo/List/Grid/DemoCostPriceFullHeight',
   'wml!Controls-demo/List/Grid/DemoName',
   'Controls/scroll',
   'Controls/grid',
], function(BaseControl, template, source) {
   'use strict';
   var
      fullColumns = [
         {
            displayProperty: 'name',
            width: '100px',
            template: 'wml!Controls-demo/List/Grid/DemoName'
         },
         {
            displayProperty: 'price',
            width: '100px',
            align: 'center',
            valign: 'bottom',
            template: 'wml!Controls-demo/List/Grid/DemoCostPriceFullHeight'
         },
      ],
   data = {
      catalog: [
         {
            id: '463152',
            name: 'Арахисовые лепестки',
            price: null,
         },
         {
            id: '447037',
            name: 'Вода газированная',
            price: null,
         },
         {
            id: '448390',
            name: 'Вафельная крошка ',
            price: null,
         },
         {
            id: '457328',
            name: 'Вода минеральная газ.',
            price: null,
         },
      ]
   },
      ModuleClass = BaseControl.extend({
         _template: template,
         _viewSource: null,
         _columnSource: null,
         gridColumns: null,
         alignedState: null,
         _selectedKeys: null,
         _beforeMount: function() {
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: data.catalog
            });
            this.gridColumns = fullColumns;
            this._selectedKeys = ['3']
            this._dropDownItems = new source.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: '1',
                     title: 'Top'
                  },
                  {
                     id: '2',
                     title: 'Middle'
                  },
                  {
                     id: '3',
                     title: 'Bottom'
                  },
               ]
            });
         },
         _onToggleValign: function(event, dropdownIndex) {
            switch(dropdownIndex[0]) {
               case '1':
                  this.gridColumns = [
                     {
                        displayProperty: 'name',
                        width: '100px',
                        template: 'wml!Controls-demo/List/Grid/DemoName'
                     },
                     {
                        displayProperty: 'price',
                        width: '100px',
                        align: 'center',
                        valign: 'top',
                        template: 'wml!Controls-demo/List/Grid/DemoCostPriceFullHeight'
                     },
                  ];
                  break;
               case '2':
                  this.gridColumns = [
                     {
                        displayProperty: 'name',
                        width: '100px',
                        template: 'wml!Controls-demo/List/Grid/DemoName'
                     },
                     {
                        displayProperty: 'price',
                        width: '100px',
                        align: 'center',
                        valign: 'middle',
                        template: 'wml!Controls-demo/List/Grid/DemoCostPriceFullHeight'
                     },
                  ];
                  break;
               case '3':
                  this.gridColumns = fullColumns;
                  break;
            }
         }
      });

   ModuleClass._styles = ['Controls-demo/List/Grid/Grid'];

   return ModuleClass;
});
