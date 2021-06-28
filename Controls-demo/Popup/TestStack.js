define('Controls-demo/Popup/TestStack',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/TestStack',
      'Types/entity',
      'require',
      'Controls/popup',
      'Types/source',
      'Controls/toolbars',
      'wml!Controls-demo/Popup/resources/InfoboxTemplate'
   ],
   function(Base, template, entity, require, popupLib, source, toolbars) {
      'use strict';
      var showType = toolbars.showType;

      var TestDialog = Base.Control.extend({
         _template: template,
         _stack: null,
         _stack2: null,
         _indicatorId: null,
         _beforeMount: function() {
            this._buttonsSource = new source.Memory({
               keyProperty: 'id',
               data: [{
                  id: '1',
                  icon: 'icon-Print',
                  title: 'Распечатать',
                  readOnly: false,
                  viewMode: 'toolButton',
                  '@parent': false,
                  parent: null
               }, {
                  id: '2',
                  viewMode: 'toolButton',
                  icon: 'icon-Link',
                  title: 'Скопировать в буфер',
                  '@parent': false,
                  parent: null
               }, {
                  id: '3',
                  showType: showType.MENU,
                  title: 'Прикрепить к',
                  '@parent': false,
                  parent: null
               }, {
                  id: '4',
                  showType: showType.MENU,
                  title: 'Проекту',
                  '@parent': false,
                  parent: '3'
               }, {
                  id: '5',
                  showType: showType.MENU,
                  title: 'Этапу',
                  '@parent': false,
                  parent: '3'
               }, {
                  id: '6',
                  icon: 'icon-EmptyMessage',
                  fontColorStyle: 'secondary',
                  showHeader: true,
                  viewMode: 'toolButton',
                  contrastBackground: true,
                  title: 'Обсудить',
                  '@parent': true,
                  parent: null
               }, {
                  id: '7',
                  showType: showType.MENU,
                  title: 'Видеозвонок',
                  '@parent': false,
                  parent: '6'
               }, {
                  id: '8',
                  showType: showType.MENU,
                  title: 'Сообщение',
                  '@parent': false,
                  parent: '6'
               }]
            });
            this._stack = new popupLib.StackOpener();
            this._stack2 = new popupLib.StackOpener();
         },
         _beforeUnmount: function() {
            this._notify('hideIndicator', [this._indicatorId], { bubbling: true });
         },
         _close: function() {
            this._notify('close', [], { bubbling: true });
         },

         _itemClick: function(event, item){
            console.error(item);
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
         _openNewStack: function() {
            this._stack.open({
               template: 'Controls-demo/Popup/Opener/resources/StackTemplate',
               opener: this._children.stackButton1,
               closeOnOutsideClick: false,
               width: 500
            });
         },
         _openNewStack2: function() {
            this._stack2.open({
               template: 'Controls-demo/Popup/Opener/resources/StackTemplate',
               opener: this._children.stackButton2,
               closeOnOutsideClick: false,
               width: 500
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
