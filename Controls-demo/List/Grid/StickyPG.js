define('Controls-demo/List/Grid/StickyPG',
   [
      'Core/Control',
      'tmpl!Controls-demo/List/Grid/resources/StickyPG/DemoPG',
      'json!Controls-demo/List/Grid/resources/StickyPG/cfg',
      'Types/source',
      'Controls-demo/List/Grid/resources/DataDemoPG',

      'Controls/scroll',
      'wml!Controls-demo/List/Grid/resources/StickyPG/TasksPhoto',
      'wml!Controls-demo/List/Grid/resources/StickyPG/TasksDescr',
      'wml!Controls-demo/List/Grid/resources/StickyPG/TasksReceived',
   ],

   function(Control, template, config, source, data) {
      'use strict';
      var DialogPG = Control.extend({
         _template: template,
         _metaData: null,
         _dataOptions: null,
         _content: 'Controls/grid:View',
         _dataObject: null,
         _componentOptions: null,

         _beforeMount: function() {
            this._dataObject = {
                stickyColumn: {
                    value: 'none',
                    items: [
                        {
                            id: 1,
                            title: 'none',
                            items: null
                        },
                        {
                            id: 2,
                            title: 'photo',
                            items: {
                                index: 0,
                                property: 'photo'
                            }
                        }
                    ]
                },
                ladderProperties: {
                    value: '[]',
                    items: [
                        {id: 1, title: 'none', items: []},
                        {id: 2, title: '[\'date\']', items: ['date']}
                    ]
                }
            };
            this._componentOptions = {
               keyProperty: 'id',
               name: 'StickyGridPG',
               columns: data.stickyDataColumns,
               multiSelectVisibility: 'hidden',
               source: new source.Memory({
                  keyProperty: 'id',
                  data: data.stickyData
               }),
                stickyColumn: undefined,
                ladderProperties: []
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      DialogPG._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

      return DialogPG;
   });
