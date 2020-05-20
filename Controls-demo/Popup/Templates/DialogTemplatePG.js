define('Controls-demo/Popup/Templates/DialogTemplatePG',
   [
      'Core/Control',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/PropertyGrid/pgtext',
      'wml!Controls-demo/Popup/Templates/resources/defaultBodyContent',
      'wml!Controls-demo/Popup/Templates/resources/headerContent',
      'wml!Controls-demo/Popup/Templates/resources/customHeaderContent',

      'wml!Controls-demo/Popup/Templates/resources/customBodyContent',
      'wml!Controls-demo/Popup/Templates/resources/defaultFooterContent',
      'wml!Controls-demo/Popup/Templates/resources/customFooterContent',

   ],

   function(Control, template, config) {
      'use strict';
      var DialogPG = Control.extend({
         _template: template,
         _metaData: null,
         _dataOptions: null,
         _content: 'Controls/popupTemplate:Dialog',
         _dataObject: null,
         _componentClass: 'controls-demo_OpenerTemplate',
         _componentOptions: null,
         _beforeMount: function() {
            this._dataObject = {
               name: {
                  readOnly: true
               },
               bodyContentTemplate: {
                  items: [
                     {
                        id: '1',
                        title: 'default',
                        template: 'wml!Controls-demo/Popup/Templates/resources/defaultBodyContent'
                     },
                     {
                        id: '2',
                        title: 'custom',
                        template: 'wml!Controls-demo/Popup/Templates/resources/customBodyContent'
                     }
                  ],
                  value: 'default'
               },
               headerContentTemplate: {
                  items: [
                     {
                        id: '1',
                        title: 'default',
                        template: 'wml!Controls-demo/Popup/Templates/resources/headerContent'
                     },
                     {
                        id: '2',
                        title: 'custom',
                        template: 'wml!Controls-demo/Popup/Templates/resources/customHeaderContent'
                     }
                  ],
                  value: 'default'
               },
               footerContentTemplate: {
                  items: [
                     {
                        id: '1',
                        title: 'default',
                        template: 'wml!Controls-demo/Popup/Templates/resources/defaultFooterContent'
                     },
                     {
                        id: '2',
                        title: 'custom',
                        template: 'wml!Controls-demo/Popup/Templates/resources/customFooterContent'
                     }
                  ],
                  value: 'default'
               },
            };
            this._componentOptions = {
               name: 'DialogTemplate',
               headingCaption: 'secondary',
               closeButtonTransparent: true,
               headerContentTemplate: 'wml!Controls-demo/Popup/Templates/resources/headerContent',
               bodyContentTemplate: 'wml!Controls-demo/Popup/Templates/resources/defaultBodyContent',
               footerContentTemplate: 'wml!Controls-demo/Popup/Templates/resources/defaultFooterContent',
               draggable: true,
               closeButtonStyle: 'default',
               closeButtonVisibility: true
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      DialogPG._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

      return DialogPG;
   });
