define('Controls-demo/List/Grid/BasePG', [
   'UI/Base',
   'Types/object',
   'Types/source',
   'Controls-demo/List/Grid/resources/DataDemoPG',
   'wml!Controls-demo/List/Grid/resources/BasePG/GridPG',
   'json!Controls-demo/List/Grid/resources/BasePG/cfg',
   'wml!Controls-demo/List/Grid/resources/BasePG/emptyTemplate',
   'wml!Controls-demo/List/Grid/resources/BasePG/footerTemplate',
   'wml!Controls-demo/List/Grid/resources/BasePG/resultsTemplate',
   'wml!Controls-demo/List/Grid/resources/DemoMoney',
   'wml!Controls-demo/List/Grid/resources/DemoRating',
   'wml!Controls-demo/List/Grid/resources/DemoItem',
   'wml!Controls-demo/List/Grid/resources/DemoResultAvgRating',
   'wml!Controls-demo/List/Grid/resources/BasePG/HeaderMoneyTemplate'
   ], function(Base, Obj, source, data, template, config, emptyTpl) {
   'use strict';
   var Component = Base.Control.extend({
      _template: template,
      _metaData: null,
      _content: 'Controls/grid:View',
      _dataObject: null,
      _componentOptions: null,

      _beforeMount: function() {

         this._sourceCatalog = new source.Memory({
            keyProperty: 'id',
            data: data.catalog
         });
         this._emptySource = new source.Memory({
            keyProperty: 'id',
            data: []
         });
         this._errorSource = new source.SbisService({});

         this._dataObject = {
            itemPadding: {
               editorType: 'ItemPadding',
               value: {
                  left: 'l',
                  right: 'l',
                  top: 'm',
                  bottom: 'm'
               }
            },
            source: {
               items: [
                  {id: '1', title: 'Films', items: this._sourceCatalog},
                  {id: '3', title: 'Empty', items: this._emptySource},
                  {id: '4', title: 'Error', items: this._errorSource}
               ],
               value: 'Films'
            },
            filter: {
               items: [
                  { id: 1, title: 'show all', items: {id: ['1', '2', '3', '4', '5']} },
                  { id: 2, title: 'USA only', items: {country: ['USA']} },
                  { id: 2, title: 'Cesar award', items: {awards: ['Cesar 2012', 'Cesar 1995']} },
                  { id: 3, title: 'By id [1,3,5]', items: {id: ['1', '3', '5']} }
               ],
               value: 'show all'
            },
            emptyTemplate: {
               readOnly: false,
               value: 'none',
               items: [
                  {
                     id: '1',
                     title: 'none',
                     template: ''
                  },
                  {
                     id: '2',
                     title: 'Empty template',
                     template: emptyTpl
                  }
               ]
            },
            columns: {
               value: 'Variant 1',
               items: [
                  {id:1, title: 'Variant 1', items: data.fullColumnsForBase },
                  {id:2, title: 'Variant 2', items: data.partialColumns}
               ]
            },
            header: {
               value: 'with header',
               items: [
                  {id: 1, title: 'none', items: null},
                  {id: 2, title: 'with header', items: data.fullHeaderForBase }
               ]
            },
            sorting: {
               value: 'none',
               items: [
                  {id: 1, title: 'none', items: null},
                  {id: 2, title: 'Box Office ASC', items: [{boxOffice: "ASC"}]},
                  {id: 2, title: 'Box Office DESC', items: [{boxOffice: "DESC"}]},
               ]
            },
            resultsTemplate: {
               readOnly: false,
               value: 'none',
               items: [
                  {
                     id: '1',
                     title: 'none',
                     template: ''
                  },
                  {
                     id: '2',
                     title: 'Results template',
                     template: 'wml!Controls-demo/List/Grid/resources/BasePG/resultsTemplate'
                  }
               ]
            },
            footerTemplate: {
               readOnly: false,
               value: 'none',
               items: [
                  {
                     id: '1',
                     title: 'none',
                     template: ''
                  },
                  {
                     id: '2',
                     title: 'Footer with add button',
                     template: 'wml!Controls-demo/List/Grid/resources/BasePG/footerTemplate'
                  }
               ]
            },
            markedKey: {
               precision: 0
            }
         };

         this._componentOptions = {
            name: 'BaseGridPG',
            source: this._sourceCatalog,
            markedKey: 4,
            itemTemplate: 'wml!Controls-demo/List/Grid/resources/DemoItem',
            columns: data.fullColumnsForBase,
            displayProperty: 'title',
            rowSeparatorVisibility: true,
            markerVisibility: 'visible',
            keyProperty: 'id',
            footerTemplate: undefined,
            emptyTemplate: undefined,
            resultsTemplate: undefined,
            resultsPosition: 'bottom',
            itemPadding: this._dataObject.itemPadding,
            filter: {},
            header: data.fullHeaderForBase
         };
         this._metaData = config[this._content].properties['ws-config'].options;
      },

      _optionsChanged: function() {
         if (!!this._componentOptions.header) {
            if (Obj.isEqual(this._componentOptions.columns, data.fullColumnsForBase)) {
               this._componentOptions.header = data.fullHeaderForBase;
            } else {
               this._componentOptions.header = data.partialHeader;
            }
         }
      }
   });
   return Component;
});
