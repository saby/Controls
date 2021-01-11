define('Controls-demo/LoadingIndicator/LoadingIndicatorPG',
   [
      'UI/Base',
      'wml!Controls-demo/LoadingIndicator/LoadingIndicatorPG',
      'json!Controls-demo/PropertyGrid/pgtext'
   ],

   function(Base, template, config) {
      'use strict';

      var result = Base.Control.extend({
         _template: template,
         _content: 'Controls-demo/LoadingIndicator/IndicatorContainer',
         _metaData: null,
         _dataObject: null,
         _componentOptions: null,
         _eventType: null,
         _nameOption: null,

         _beforeMount: function() {
            this._componentOptions = {
               name: 'loadingIndicator',

               isGlobal: false,
               message: 'Пожалуйста,подождите',
               scroll: '',
               small: '',
               overlay: 'dark',
               mods: '',
               delay: 3
            };
            this._dataObject = {
               isGlobal: {
                  type: 'Boolean',
                  value: false
               },
               message: {
                  type: 'String'
               },
               scroll: {
                  type: 'String',
                  items: [
                     { id: '1', title: 'left', value: 'left' },
                     { id: '2', title: 'right', value: 'right' },
                     { id: '3', title: 'top', value: 'top' },
                     { id: '4', title: 'bottom', value: 'bottom' }
                  ],
                  value: 'top'
               },
               small: {
                  type: 'String',
                  items: [
                     { id: '1', title: 'yes', value: 'yes' },
                     { id: '2', title: 'no', value: 'no' }
                  ],
                  value: 'no'
               },
               overlay: {
                  items: [
                     { id: '1', title: 'default', value: 'default' },
                     { id: '2', title: 'dark', value: 'dark' },
                     { id: '3', title: 'none', value: 'none' }
                  ],
                  type: 'String',
                  value: 'dark'
               },
               mods: {
                  type: 'String',
                  items: [
                     {
                        id: '1', title: '', value: []
                     },
                     {
                        id: '2', title: 'gray', value: 'gray'
                     }
                  ],
                     value: 'gray'
               },
               delay: {
                  type: 'Number',
                  value: 0
               }
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return result;
   });
