define('Controls-demo/Popup/Opener/StackDemo',
   [
      'Core/Control',
      'wml!Controls-demo/Popup/Opener/StackDemo',
      'wml!Controls-demo/Popup/Opener/resources/footer',
      'wml!Controls-demo/Popup/Opener/DialogTpl',
      'wml!Controls-demo/Popup/Opener/resources/StackTemplateWithoutHead',
   ],
   function(Control, template) {
      'use strict';

      var PopupPage = Control.extend({
         _template: template,
         openStack: function() {
            this._children.stack.open({
               opener: this._children.button1,
               closeOnOutsideClick: true,
               template: 'Controls-demo/Popup/Opener/resources/StackTemplate',
               width: 600
            });
         },
         openModalStack: function() {
            this._children.stack.open({
               opener: this._children.button4,
               modal: true,
               template: 'Controls-demo/Popup/Opener/resources/StackTemplate',
               width: 600
            });
         },
         openDialog: function() {
            this._children.dialog.open({
               opener: this._children.button3,
               closeOnOutsideClick: true,
               templateOptions: {
                  draggable: true
               },
               maxHeight: 700,
               maxWidth: 700,
               minWidth: 450
            });
         },
         openModalDialog: function() {
            this._children.dialog.open({
               opener: this._children.button5,
               templateOptions: {
                  footerContentTemplate: 'wml!Controls-demo/Popup/Opener/resources/footer',
               },
               modal: true,
               maxHeight: 700,
               maxWidth: 700,
               minWidth: 450
            });
         },
         openSticky: function() {
            this._children.sticky.open({
               target: this._children.stickyButton2._container,
               opener: this._children.stickyButton2,
               actionOnScroll: 'track',
               template: 'wml!Controls-demo/Popup/Opener/DialogTpl'
            });
         },
         openStickyScroll: function() {
            this._children.sticky.open({
               target: this._children.stickyButton._container,
               opener: this._children.stickyButton,
               actionOnScroll: 'close',
               template: 'wml!Controls-demo/Popup/Opener/DialogTpl'
            });
         },
         openMaximizedStack: function() {
            this._children.stack.open({
               opener: this._children.button2,
               minimizedWidth: 600,
               minWidth: 600,
               width: 600,
               maxWidth: 800,
               template: 'Controls-demo/Popup/Opener/resources/StackTemplate',
               templateOptions: {
                  maximized: true,
                  maximizedButtonVisibility: true
               }
            });
         },
         openStackCustomHeader: function() {
            this._children.stack.open({
               opener: this._children.button6,
               template: 'Controls-demo/Popup/Opener/resources/StackTemplateHeader',
            });
         },
         openStackWithoutHead: function() {
            this._children.stack.open({
               opener: this._children.button7,
               width: 800,
               template: 'wml!Controls-demo/Popup/Opener/resources/StackTemplateWithoutHead',
            });
         }
      });
      PopupPage._styles = ['Controls-demo/Popup/PopupPage', 'Controls-demo/Popup/Opener/resources/StackHeader'];

      return PopupPage;
   });
