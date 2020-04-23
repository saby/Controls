define('Controls-demo/List/Grid/EditableGrid', [
   'Core/Control',
   'wml!Controls-demo/List/Grid/resources/EditableGrid/EditableGrid',
   'Types/source',
], function(BaseControl, template, source, ItemTemplate) {
   'use strict';
   var
      ModuleClass = BaseControl.extend({
         _template: template,
         _styles: ['Controls-demo/List/Grid/resources/EditableGrid/EditableGrid'],
         _itemTemplate: ItemTemplate,
         _source: null,
         _columns: null,
         _beforeMount: function() {
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
            this._documentSignMemory = new source.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: 1,
                     title: 'ТД предусмотрено'
                  },
                  {
                     id: 2,
                     title: 'ТД не предусмотрено'
                  }
               ]
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
         }
      });

   return ModuleClass;
});
