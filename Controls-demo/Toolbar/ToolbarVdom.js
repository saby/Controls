define('Controls-demo/Toolbar/ToolbarVdom', [
   'Core/Control',
   'Types/source',
   'wml!Controls-demo/Toolbar/ToolbarVdom',
   'css!Controls-demo/Toolbar/ToolbarVdom',
   'wml!Controls-demo/Toolbar/resources/itemTemplate',
   'wml!Controls-demo/Toolbar/resources/itemTemplateContent',
], function(Control, source, template) {
   'use strict';
   var ModuleClass = Control.extend(
      {
         _template: template,
         _defaultItems: null,
         _flatItems: null,
         _currentClick: 'Нажми на тулбар',

         _getDefaultMemory: function() {
            return new source.Memory({
               keyProperty: 'id',
               data: this._defaultItems
            });
         },

         _getMemorySource: function(items) {
            return new source.Memory({
               keyProperty: 'id',
               data: items
            });
         },

         constructor: function() {
            this._itemClick = this._itemClick.bind(this);
            ModuleClass.superclass.constructor.apply(this, arguments);
            this._defaultItems = [
               {
                  id: '1',
                  showType: 2,
                  icon: 'icon-Time icon-medium',
                  '@parent': false,
                  parent: null
               },
               {
                  id: '3',
                  icon: 'icon-Print icon-medium',
                  title: 'Распечатать',
                  '@parent': false,
                  parent: null
               },
               {
                  id: '4',
                  icon: 'icon-24 icon-Linked',
                  fontColorStyle: 'secondary',
                  viewMode: 'toolButton',
                  iconStyle: 'secondary',
                  contrastBackground: true,
                  title: 'Связанные документы',
                  '@parent': true,
                  parent: null
               },
               {
                  id: '5',
                  viewMode: 'icon',
                  icon: 'icon-Link icon-medium',
                  title: 'Скопировать в буфер',
                  '@parent': false,
                  parent: null
               },
               {
                  id: '6',
                  showType: 0,
                  title: 'Прикрепить к',
                  '@parent': false,
                  parent: null,
                  readOnly: true
               },
               {
                  id: '7',
                  showType: 1,
                  title: 'Проекту',
                  '@parent': false,
                  parent: '4'
               },
               {
                  id: '8',
                  showType: 0,
                  title: 'Этапу',
                  '@parent': false,
                  parent: '4'
               },
               {
                  id: '9',
                  showType: 0,
                  title: 'Согласование',
                  '@parent': false,
                  parent: '2'
               },
               {
                  id: '10',
                  showType: 0,
                  title: 'Задача',
                  '@parent': false,
                  parent: '2'
               },
               {
                  id: '11',
                  icon: 'icon-medium icon-EmptyMessage',
                  fontColorStyle: 'secondary',
                  showHeader: true,
                  viewMode: 'link',
                  iconStyle: 'secondary',
                  contrastBackground: true,
                  title: 'Обсудить',
                  '@parent': true,
                  parent: null,
                  readOnly: true
               },
               {
                  id: '12',
                  showType: 0,
                  title: 'Видеозвонок',
                  '@parent': false,
                  parent: '11'
               },
               {
                  id: '13',
                  showType: 0,
                  title: 'Сообщение',
                  '@parent': false,
                  parent: '11'
               },
               {
                  id: '14',
                  showType: 0,
                  icon: 'icon-medium icon-Groups',
                  fontColorStyle: 'secondary',
                  title: 'Совещания',
                  '@parent': true,
                  parent: null,
                  additional: true
               },
               {
                  id: '2',
                  showType: 0,
                  icon: 'icon-medium icon-Report',
                  fontColorStyle: 'secondary',
                  title: 'Список задач',
                  '@parent': true,
                  parent: null,
                  additional: true
               }
            ];
            this._defaultItemsWithoutToolbutton = [
               {
                  id: '1',
                  icon: 'icon-Print icon-medium',
                  title: 'Распечатать',
                  '@parent': false,
                  parent: null
               },
               {
                  id: '2',
                  viewMode: 'icon',
                  icon: 'icon-Link icon-medium',
                  title: 'Скопировать в буфер',
                  '@parent': false,
                  parent: null
               },
               {
                  id: '3',
                  showType: 0,
                  title: 'Прикрепить к',
                  '@parent': false,
                  parent: null
               },
               {
                  id: '4',
                  showType: 0,
                  title: 'Проекту',
                  '@parent': false,
                  parent: '3'
               },
               {
                  id: '5',
                  showType: 0,
                  title: 'Этапу',
                  '@parent': false,
                  parent: '3'
               },
               {
                  id: '6',
                  icon: 'icon-medium icon-EmptyMessage',
                  fontColorStyle: 'secondary',
                  showHeader: true,
                  viewMode: 'link',
                  iconStyle: 'secondary',
                  contrastBackground: true,
                  title: 'Обсудить',
                  '@parent': true,
                  parent: null,
                  readOnly: true
               },
               {
                  id: '7',
                  showType: 0,
                  title: 'Видеозвонок',
                  '@parent': false,
                  parent: '6'
               },
               {
                  id: '8',
                  showType: 0,
                  title: 'Сообщение',
                  '@parent': false,
                  parent: '6'
               }
            ];
            this._flatItems = [
               {
                  id: '1',
                  showType: 2,
                  icon: 'icon-Time  icon-medium',
                  fontColorStyle: 'secondary',
                  viewMode: 'toolButton',
                  iconStyle: 'secondary',
                  contrastBackground: true,
                  title: 'Время',
                  '@parent': true,
                  parent: null
               },
               {
                  id: '2',
                  showType: 2,
                  icon: 'icon-Linked icon-medium',
                  fontColorStyle: 'secondary',
                  viewMode: 'toolButton',
                  iconStyle: 'secondary',
                  contrastBackground: true,
                  title: 'Связанные документы'
               },
               {
                  id: '3',
                  showType: 2,
                  icon: 'icon-Author icon-medium',
                  fontColorStyle: 'secondary',
                  viewMode: 'toolButton',
                  iconStyle: 'secondary',
                  contrastBackground: true,
                  title: 'Автор'
               }
            ];
         },

         _itemClick: function(event, item) {
            this._currentClick = 'Вы нажали на ' + item.getId();
         }
      });
   return ModuleClass;
});
