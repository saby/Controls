define('Controls-demo/Popup/Templates/StackTemplatePG',
   [
      'Core/Control',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/PropertyGrid/pgtext',
      'wml!Controls-demo/Popup/Templates/resources/defaultBodyContent',
      'wml!Controls-demo/Popup/Templates/resources/customBodyContent',
      'wml!Controls-demo/Popup/Templates/resources/defaultFooterContent',
      'wml!Controls-demo/Popup/Templates/resources/customFooterContent',
      'wml!Controls-demo/Popup/Templates/resources/headerContent',
      'wml!Controls-demo/Popup/Templates/resources/customHeaderContent',

   ],

   function(Control, template, config) {
      'use strict';
      var DialogPG = Control.extend({
         _template: template,
         _metaData: null,
         _dataOptions: null,
         _content: 'Controls/popupTemplate:Stack',
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
               name: 'StackTemplate',
               headingCaption: 'caption',
               headingFontColorStyle: 'secondary',
               headerContentTemplate: 'wml!Controls-demo/Popup/Templates/resources/headerContent',
               bodyContentTemplate: 'wml!Controls-demo/Popup/Templates/resources/defaultBodyContent',
               footerContentTemplate: 'wml!Controls-demo/Popup/Templates/resources/defaultFooterContent',
               draggable: true,
               closeButtonViewMode: 'popup',
               closeButtonVisibility: true,
               closeButtonTransparent: true,
               maximizeButtonVisibility: true
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      DialogPG._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

      return DialogPG;
   });
