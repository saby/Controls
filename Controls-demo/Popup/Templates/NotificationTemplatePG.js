define('Controls-demo/Popup/Templates/NotificationTemplatePG',
   [
      'UI/Base',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/PropertyGrid/pgtext',
      'wml!Controls-demo/Popup/Templates/resources/defaultBodyContent',
      'wml!Controls-demo/Popup/Templates/resources/customBodyContent',

   ],

   function(Base, template, config) {
      'use strict';
      var DialogPG = Base.Control.extend({
         _template: template,
         _metaData: null,
         _dataOptions: null,
         _content: 'Controls/popupTemplate:Notification',
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
               }
            };
            this._componentOptions = {
               name: 'NotificationTemplate',
               closeButtonVisibility: true,
               style: 'primary',
               bodyContentTemplate: 'wml!Controls-demo/Popup/Templates/resources/defaultBodyContent'
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      DialogPG._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

      return DialogPG;
   });
