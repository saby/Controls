define('Controls-demo/Popup/Opener/StickyPG',
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
         _metaData: null,
         _dataOptions: null,
         _content: 'Controls/popup:Sticky',
         _nameOpener: 'stickyOpener',
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
                        id: 1,
                        title: 'Dialog template',
                        template: 'wml!Controls-demo/Popup/Opener/DialogTpl'
                     },
                     {
                        id: 2,
                        title: 'Confirmation template',
                        template:  'Controls-demo/Popup/Opener/ConfirmationTpl'
                     }
                  ],
                  value: 'Dialog template'
               },
               templateOptions: {
                  baseObject: {
                     value: 'MyText'
                  }
               },
               direction: {
                  baseObject: {
                     vertical : 'bottom',
                     horizontal: 'right'
                  }
               },
               targetPoint: {
                  baseObject: {
                     vertical : 'bottom',
                     horizontal: 'right'
                  }
               },
              offset: {
                  flag: 'Number',
                  baseObject: {
                     vertical : 20,
                     horizontal: 20
                  }
               }
            };
            this._componentOptions = {
               autofocus: true,
               direction:{
                  vertical : 'bottom',
                  horizontal: 'right'
               },
               targetPoint:{
                  vertical : 'bottom',
                  horizontal: 'right'
               },
               actionOnScroll: 'close',
               fittingMode: 'fixed',
               name: 'StickyOpener',
               modal: false,
               className: 'controls_StickyOpener',
               closeOnOutsideClick: true,
               template:  'wml!Controls-demo/Popup/Opener/DialogTpl',
               templateOptions:  { value: 'My text' },
               width: 550,
               height: 300,
               maxHeight: 500,
               maxWidth: 600,
               minWidth: 550,
               minHeight: 300,
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      DialogPG._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

      return DialogPG;
   });
