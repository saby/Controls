define('Controls-demo/Popup/TestStack',
   [
      'Core/Control',
      'wml!Controls-demo/Popup/TestStack',
      'Types/entity',
      'require',
      'wml!Controls-demo/Popup/resources/InfoboxTemplate'
   ],
   function(Control, template, entity, require) {
      'use strict';

      var TestDialog = Control.extend({
         _template: template,
         _indicatorId: null,
         _beforeUnmount: function() {
            this._notify('hideIndicator', [this._indicatorId], { bubbling: true });
         },

         _close: function() {
            this._notify('close', [], { bubbling: true });
         },

         _onClick: function() {
            if (this._options.type === 'sticky') {
               this._notify('sendResult', [123], { bubbling: true });
            } else {
               this._openStack();
            }
         },

         _openStack: function() {
            this._children.stack.open({
               templateOptions: {
                  width: '600px'
               }
            });
         },

         _openInfobox: function() {
            var cfg = {
               template: 'wml!Controls-demo/Popup/resources/InfoboxTemplate',
               target: this._children.infoboxButton._container
            };
            this._notify('openInfobox', [cfg], { bubbling: true });
         },
         _openFC: function() {
            this._children.formControllerOpener.open();
         },
         _openModalDialog: function() {
            this._children.modalDialog.open();
         },
         _openIndicator: function() {
            this._notify('hideIndicator', [this._indicatorId], { bubbling: true });
            // Это демка. сделал задержку 500, потому что мне так нравится
            this._indicatorId = this._notify('showIndicator', [{ message: 'Индикатор загрузки', overlay: 'dark', delay: 500 }], { bubbling: true });
            this._openStack();
         },
         _openOldPanel: function(event, tplName, mode, isStack) {
            require(['SBIS3.CONTROLS/Action/List/OpenEditDialog', tplName], function(OpenEditDialog) {
               new OpenEditDialog().execute({
                  template: tplName,
                  mode: mode,
                  item: new entity.Record(),
                  dialogOptions: {
                     isStack: isStack
                  }
               });
            });
         }
      });

      return TestDialog;
   });
