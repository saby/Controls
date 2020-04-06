define('Controls-demo/Popup/Opener/StackPG',
   [
      'Core/Control',
      'tmpl!Controls-demo/Popup/Opener/OpenerDemoPG',
      'json!Controls-demo/PropertyGrid/pgtext',
      'wml!Controls-demo/Popup/Opener/DialogTpl',
      'Controls/popupTemplate',
      'wml!Controls-demo/Popup/Opener/DefaultStack',
      'wml!Controls-demo/Popup/Opener/MaximazedStack',

      'css!Controls-demo/Filter/Button/PanelVDom',
      'css!Controls-demo/Input/resources/VdomInputs',
      'css!Controls-demo/Wrapper/Wrapper',
   ],

   function(Control, template, config) {
      'use strict';
      var DialogPG = Control.extend({
         _template: template,
         _metaData: null,
         _dataOptions: null,
         _content: 'Controls/popup:Stack',
         _nameOpener: 'StackOpener',
         _dataObject: null,
         _componentOptions: null,
         _beforeMount: function() {
            this._dataObject = {
               template: {
                  items: [
                     {
                        id: '1',
                        title: 'Default',
                        template: 'wml!Controls-demo/Popup/Opener/DefaultStack'
                     },
                     {
                        id: '2',
                        title: 'Maximized',
                        template: 'wml!Controls-demo/Popup/Opener/MaximazedStack',
                     }
                  ],
                  value: 'Default'
               },
               templateOptions: {
                  items: [
                     { id: '1', title: '{ value: \'My text\' }', items: { value: 'My text' }},
                     { id: '2', title: '{   }', items: {} }
                  ],
                  value: '{ value: \'My text\' }'
               }
            };
            this._componentOptions = {
               name: 'Stack',
               autofocus: true,
               modal: false,
               className: 'stack_demoPG',
               closeByOutsideClick: true,
                template: 'wml!Controls-demo/Popup/Opener/DefaultStack',
               templateOptions: { value: 'My text' },
               width: 300,
               minWidth: 300,
               maxWidth: 500
               //minimizedWidth: 200
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return DialogPG;
   });
