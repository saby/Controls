define('Controls-demo/List/List/ItemActionsPG',
   [
      'Core/Control',
      'Types/source',
      'Controls-demo/Utils/MemorySourceFilter',
      'Controls-demo/List/List/resources/DataDemoPG',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/List/List/resources/ItemActionsPG/cfg',

   ],

   function(Control, sourceLib, memorySourceFilter, data, template, config) {
      'use strict';
      var Component = Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/list:View',
         _dataObject: null,
         _componentOptions: null,
         _sourceGadgets: null,

         _beforeMount: function() {

            this._sourceGadgets = new sourceLib.Memory({
               keyProperty: 'id',
               data: data.gadgets,
               filter: memorySourceFilter()
            });

            this._dataObject = {
               itemActions: {
                  value: 'variant 1',
                  items: [
                     {
                        id: 1,
                        title: 'none',
                        items: []
                     },
                     {
                        id: 2,
                        title: 'variant 1',
                        items: data.firstItemActionsArray
                     },
                     {
                        id: 3,
                        title: 'variant 2',
                        items: data.secondItemActionsArray
                     }
                  ]
               },
               itemActionVisibilityCallback: {
                  value: 'none',
                  items: [
                     {
                        id: 1,
                        title: 'none',
                        template: null
                     },
                     {
                        id: 1,
                        title: 'variant 1',
                        template: function(action, item) {
                           if (item.get('id') === 2) {
                              if (action.id === 2 || action.id === 3) {
                                 return false;
                              }
                              return true;
                           }
                           if (action.id === 5) {
                              return false;
                           }
                           if (item.get('id') === 4) {
                              return false;
                           }
                           return true;
                        }
                     }
                  ]
               },
               itemActionsPosition: {
                  value: 'inside',
                  items: [
                     {
                        id: 1,
                        title: 'inside',
                        value: 'inside'
                     },
                     {
                        id: 2,
                        title: 'outside',
                        value: 'outside'
                     }
                  ]
               }
            };
            this._componentOptions = {
               keyProperty: 'id',
               name: "ItemActionsPG",
               markedKey: '3',
               allowEmptySelection: false,
               source: this._sourceGadgets,
               itemActions: data.firstItemActionsArray,
               itemActionsPosition: this._dataObject.itemActionsPosition.value,
               itemActionVisibilityCallback: null,
               contextMenuEnabled: false
            };

            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      Component._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

      return Component;
   });
