define('Controls-demo/Popup/Opener/ConfirmationPG',
   [
      'Core/Control',
      'tmpl!Controls-demo/Popup/Opener/OpenerDemoPG',
      'json!Controls-demo/PropertyGrid/pgtext',
      'wml!Controls-demo/Popup/Opener/DialogTpl',
      'wml!Controls-demo/Popup/Opener/ConfirmationTpl',

   ],

   function(Control, template, config) {
      'use strict';
      var DialogPG = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'],
         _metaData: null,
         _dataOptions: null,
         _content: 'Controls/popup:Confirmation',
         _nameOpener: 'confirmationOpener',
         _dataObject: null,
         _dialogResult: true,
         _componentOptions: null,
         _beforeMount: function() {
            this._dataObject = {
               name: {
                  readOnly: true
               }
            };
            this._componentOptions = {
               name: 'Dialog',
               type: 'yesnocancel',
               style: 'success',
               message: ' Do you like football?',
               details: ' just give me an honest answer',
               yesCaption: 'yes',
               noCaption: 'no',
               cancelCaption: 'cancel',
               okCaption: 'ok'
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return DialogPG;
   });
