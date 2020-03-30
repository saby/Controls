define('Controls-demo/Explorer/Demo', [
   'Core/Control',
   'wml!Controls-demo/Explorer/Demo/Demo',
   'Types/source',
   'Controls/Utils/Toolbar',
   'Controls/Constants',
   'Controls-demo/Explorer/ExplorerImages',
   'css!Controls-demo/Explorer/Demo/Demo',
   'Controls/explorer'
], function(BaseControl, template, source, Toolbar, constants, explorerImages) {
   'use strict';
   var
      ModuleClass = BaseControl.extend({
         _template: template,
         _viewSource: null,
         _selectedKeys: [],
         _excludedKeys: [],
         _beforeMount: function() {
            this._viewSource = new source.HierarchicalMemory({
               keyProperty: 'id',
               parentProperty: 'parent',
               data: [{
                  id: 1,
                  'parent': null,
                  'type': true,
                  title: 'Документы отделов'
               }, {
                  id: 11,
                  'parent': 1,
                  'type': true,
                  title: '1. Электронный документооборот'
               }, {
                  id: 12,
                  'parent': 1,
                  'type': true,
                  title: '2. Отчетность через интернет'
               }, {
                  id: 13,
                  'parent': 1,
                  'type': null,
                  title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                  image: explorerImages[4],
                  isDocument: true
               }, {
                  id: 111,
                  'parent': 11,
                  'type': true,
                  title: 'Задачи'
               }, {
                  id: 112,
                  'parent': 11,
                  'type': null,
                  title: 'Сравнение систем по учету рабочего времени.xlsx',
                  image: explorerImages[5],
                  isDocument: true
               }, {
                  id: 2,
                  'parent': null,
                  'type': true,
                  title: 'Техническое задание'
               }, {
                  id: 21,
                  'parent': 2,
                  'type': null,
                  title: 'PandaDoc.docx',
                  image: explorerImages[6],
                  isDocument: true
               }, {
                  id: 22,
                  'parent': 2,
                  'type': null,
                  title: 'SignEasy.docx',
                  image: explorerImages[7],
                  isDocument: true
               }, {
                  id: 3,
                  'parent': null,
                  'type': true,
                  title: 'Анализ конкурентов'
               }, {
                  id: 4,
                  'parent': null,
                  'type': null,
                  title: 'Договор на поставку печатной продукции',
                  image: explorerImages[0],
                  isDocument: true
               }, {
                  id: 5,
                  'parent': null,
                  'type': null,
                  title: 'Договор аренды помещения',
                  image: explorerImages[1],
                  isDocument: true
               }, {
                  id: 6,
                  'parent': null,
                  'type': null,
                  title: 'Конфеты',
                  image: explorerImages[3]

               }, {
                  id: 7,
                  'parent': null,
                  'type': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImages[2],
                  isDocument: true
               }]
            });
            this._viewSourceDynamic = new source.HierarchicalMemory({
               keyProperty: 'id',
               parentProperty: 'parent',
               data: [{
                  id: 1,
                  'parent': null,
                  'type': null,
                  title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                  image: explorerImages[4],
                  isDocument: true,
                  hiddenGroup: true,
                  width: 200
               }, {
                  id: 2,
                  'parent': null,
                  'type': null,
                  title: 'Сравнение систем по учету рабочего времени.xlsx',
                  image: explorerImages[5],
                  isDocument: true,
                  hiddenGroup: true,
                  width: 200
               }, {
                  id: 3,
                  'parent': null,
                  'type': null,
                  title: 'Конфеты копия',
                  image: explorerImages[3],
                  width: 300
               }, {
                  id: 4,
                  'parent': null,
                  'type': null,
                  title: 'PandaDoc.docx',
                  image: explorerImages[6],
                  isDocument: true,
                  width: 200
               }, {
                  id: 5,
                  'parent': null,
                  'type': null,
                  title: 'SignEasy.docx',
                  image: explorerImages[7],
                  isDocument: true,
                  width: 200
               }, {
                  id: 6,
                  'parent': null,
                  'type': null,
                  title: 'Договор на поставку печатной продукции',
                  image: explorerImages[0],
                  isDocument: true,
                  width: 200
               }, {
                  id: 7,
                  'parent': null,
                  'type': null,
                  title: 'Договор аренды помещения',
                  image: explorerImages[1],
                  isDocument: true,
                  width: 200
               }, {
                  id: 8,
                  'parent': null,
                  'type': null,
                  title: 'Конфеты',
                  image: explorerImages[3],
                  width: 300
               }, {
                  id: 9,
                  'parent': null,
                  'type': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImages[2],
                  isDocument: true,
                  width: 200
               }]
            });
            this._itemActions = [
               {
                  id: 1,
                  icon: 'icon-PhoneNull',
                  title: 'phone',
                  showType: Toolbar.showType.MENU
               },
               {
                  id: 2,
                  icon: 'icon-EmptyMessage',
                  title: 'message',
                  showType: Toolbar.showType.MENU
               }
            ];
         },
         _groupingKeyCallback: function(item) {
            var group;
            if (item.get('hiddenGroup')) {
               group = constants.view.hiddenGroup;
            } else {
               group = item.get('isDocument') ? 'document' : 'image';
            }
            return group;
         }
      });

   return ModuleClass;
});
