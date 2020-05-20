define('Controls-demo/List/Grid/DocsBase', [
   'Core/Control',
   'wml!Controls-demo/List/Grid/resources/DocsBase/DocsBase',
   'Types/source',
   'Controls/Constants',
   'Controls-demo/List/Grid/resources/DataDemoPG',

   'wml!Controls-demo/List/Grid/resources/BasePG/resultsTemplate',
   'wml!Controls-demo/List/Grid/resources/BasePG/HeaderMoneyTemplate',
   'wml!Controls-demo/List/Grid/resources/DemoMoney',
   'wml!Controls-demo/List/Grid/resources/DemoRating'
], function(BaseControl, template, source, ControlsConstants, ItemTemplate, data) {
   'use strict';
   var
      ModuleClass = BaseControl.extend({
         _template: template,
         _itemTemplate: ItemTemplate,
         _source: null,
         _columns: null,
         _beforeMount: function() {
            this._sorting = [{ boxOffice: 'ASC' }];
            this._columns = [
               {
                  width: '100px',
                  displayProperty: 'invoice'
               },
               {
                  width: '200px',
                  displayProperty: 'documentSign'
               },
               {
                  width: '200px',
                  displayProperty: 'document'
               },
               {
                  width: '1fr',
                  displayProperty: 'description'
               },
               {
                  width: '200px',
                  displayProperty: 'taxBase'
               }
            ];
            this._header = data.fullHeaderForBase;
            this._columnsDemo2 = data.fullColumnsForBase;
            this._headerSource = new source.Memory({
               keyProperty: 'id',
               data: data.catalog
            });
            this._source = new source.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: 1,
                     invoice: 3500,
                     documentSign: 1,
                     documentNum: 10,
                     taxBase: 17215.00,
                     document: 'б/н',
                     documentDate: null,
                     serviceContract: null,
                     description: 'морской/речной',
                     shipper: null
                  },
                  {
                     id: 2,
                     invoice: 3501,
                     documentSign: 1,
                     documentNum: 10,
                     taxBase: 21015.00,
                     document: '48000560-ABCC',
                     documentDate: null,
                     serviceContract: null,
                     description: 'морской/речной',
                     shipper: null
                  },
                  {
                     id: 3,
                     invoice: 3502,
                     documentSign: 2,
                     documentNum: 10,
                     taxBase: 890145.04,
                     document: '456990005',
                     documentDate: null,
                     serviceContract: null,
                     description: 'ж/д, морской/речной',
                     shipper: null
                  }
               ]
            });
         },

         _dataLoadCallback: function(items) {
            items.setMetaData({
               groupResults: {
                  description: 'морской/речной'
               }
            });
         },

         _groupingKeyCallback: function(item) {
            if (item.get('description') === 'морской/речной') {
               return ControlsConstants.view.hiddenGroup;
            }
            return item.get('description');
         },
      });

   ModuleClass._styles = ['Controls-demo/List/Grid/resources/DocsBase/DocsBase'];

   return ModuleClass;
});
