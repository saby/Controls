define('Controls-demo/Popup/Opener/NotificationPG',
   [
      'Core/Control',
      'tmpl!Controls-demo/Popup/Opener/OpenerDemoPG',
      'json!Controls-demo/PropertyGrid/pgtext',
      'wml!Controls-demo/Popup/Opener/resources/BaseNotification',
      'wml!Controls-demo/Popup/Opener/resources/CustomNotification',
      'wml!Controls-demo/Popup/Opener/ConfirmationTpl',

   ],

   function(Control, template, config) {
      'use strict';
      var DialogPG = Control.extend({
         _template: template,
         _metaData: null,
         _dataOptions: null,
         _content: 'Controls/popup:Notification',
         _nameOpener: 'notificationOpener',
         _dataObject: null,
         _componentOptions: null,
         _beforeMount: function() {
            this._dataObject = {
               name: {
                  readOnly: true
               },
               template: {
                  items: [
                     {
                        id: '1',
                        title: 'Base',
                        template: 'wml!Controls-demo/Popup/Opener/resources/BaseNotification'
                     },
                     {
                        id: '2',
                        title: 'Custom',
                        template: 'wml!Controls-demo/Popup/Opener/resources/CustomNotification'
                     }
                  ],
                  value: 'Base'
               },
               templateOptions: {
                  items: [
                     { id: '1', title: '{ value: \'Base text\'}', items: { value: 'Base text'}},
                     { id: '2', title: '{ value: \'Custom text\'}', items: { value: 'Custom text'} }
                  ],
                  value: '{ value: \'Base text\'}'
               }
            };
            this._componentOptions = {
               name: 'Notification',
               className: 'controls-Notification-demoPG',
               template: 'wml!Controls-demo/Popup/Opener/resources/BaseNotification',
               templateOptions: { value: 'Base text'}
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      DialogPG._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

      return DialogPG;
   });
