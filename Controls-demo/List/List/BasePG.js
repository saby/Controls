define('Controls-demo/List/List/BasePG',
   [
      'UI/Base',
      'Types/source',
      'Controls-demo/Utils/MemorySourceFilter',
      'Controls-demo/List/List/resources/DataDemoPG',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/List/List/resources/BasePG/cfg',
      'wml!Controls-demo/List/List/resources/BasePG/emptyTemplate',
      'wml!Controls-demo/List/List/resources/BasePG/footerTemplate'
   ],

   function(Base, sourceLib, memorySourceFilter, data, template, config, emptyTpl) {
      'use strict';
      var Component = Base.Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/list:View',
         _dataObject: null,
         _componentOptions: null,
         _sourceGadgets: null,
         _sourceMusic: null,
         _emptySource: null,


         _beforeMount: function() {

            this._sourceGadgets = new sourceLib.Memory({
               keyProperty: 'id',
               data: data.gadgets,
               filter: memorySourceFilter()
            });
            this._sourceMusic = new sourceLib.Memory({
               keyProperty: 'id',
               data: data.music,
               filter: memorySourceFilter()
            });
            this._emptySource = new sourceLib.Memory({
               keyProperty: 'id',
               data: [],
               filter: memorySourceFilter()
            });
            this._errorSource = new sourceLib.SbisService({});

            this._dataObject = {
               itemPadding: {
                  editorType: 'ItemPadding',
                  value: {
                     left: 'l',
                     right: 'xl',
                     top: 's',
                     bottom: 's'
                  }
               },
               source: {
                  items: [
                     {id: '1', title: 'Gadgets', items: this._sourceGadgets},
                     {id: '2', title: 'Music', items: this._sourceMusic},
                     {id: '3', title: 'Empty', items: this._emptySource},
                     {id: '4', title: 'Error', items: this._errorSource}
                  ],
                  value: 'Gadgets'
               },
               filter: {
                  items: [
                     { id: 1, title: 'show all', items: {id: ['1', '2', '3', '4', '5']} },
                     { id: 2, title: '[\'1\', \'3\', \'5\']', items: {id: ['1', '3', '5']} },
                     { id: 3, title: '[\'1\', \'2\', \'3\']', items: {id: ['1', '2', '3']} },
                     { id: 4, title: '[\'2\', \'4\']', items: {id: ['2', '4']} }
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
                        template: 'wml!Controls-demo/List/List/resources/BasePG/footerTemplate'
                     }
                  ]
               },
               keyProperty: {
                  value: 'id'
               }
            };
            this._componentOptions = {
               name: 'BasePG',
               source: this._sourceGadgets,
               markedKey: '2',
               markerVisibility: 'visible',
               keyProperty: 'id',
               filter: undefined,
               emptyTemplate: undefined,
               footerTemplate: undefined,
               itemPadding: this._dataObject.itemPadding.value
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return Component;
   });
