define('Controls-demo/Explorer/DemoLayout', [
   'Controls-demo/Explorer/Demo',
   'Controls-demo/Explorer/ExplorerImagesLayout',
   'Types/source',
], function(Demo, explorerImagesLayout, source) {
   'use strict';
   var
      ModuleClass = Demo.extend({
         _beforeMount: function() {
            ModuleClass.superclass._beforeMount.apply(this, arguments);
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
                  image: explorerImagesLayout[4],
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
                  image: explorerImagesLayout[5],
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
                  image: explorerImagesLayout[6],
                  isDocument: true
               }, {
                  id: 22,
                  'parent': 2,
                  'type': null,
                  title: 'SignEasy.docx',
                  image: explorerImagesLayout[7],
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
                  image: explorerImagesLayout[0],
                  isDocument: true
               }, {
                  id: 5,
                  'parent': null,
                  'type': null,
                  title: 'Договор аренды помещения',
                  image: explorerImagesLayout[1],
                  isDocument: true
               }, {
                  id: 6,
                  'parent': null,
                  'type': null,
                  title: 'Конфеты',
                  image: explorerImagesLayout[3]

               }, {
                  id: 7,
                  'parent': null,
                  'type': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
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
                  image: explorerImagesLayout[4],
                  isDocument: true,
                  hiddenGroup: true,
                  width: 200
               }, {
                  id: 2,
                  'parent': null,
                  'type': null,
                  title: 'Сравнение систем по учету рабочего времени.xlsx',
                  image: explorerImagesLayout[5],
                  isDocument: true,
                  hiddenGroup: true,
                  width: 200
               }, {
                  id: 3,
                  'parent': null,
                  'type': null,
                  title: 'Конфеты копия',
                  image: explorerImagesLayout[3],
                  width: 300
               }, {
                  id: 4,
                  'parent': null,
                  'type': null,
                  title: 'PandaDoc.docx',
                  image: explorerImagesLayout[6],
                  isDocument: true,
                  width: 200
               }, {
                  id: 5,
                  'parent': null,
                  'type': null,
                  title: 'SignEasy.docx',
                  image: explorerImagesLayout[7],
                  isDocument: true,
                  width: 200
               }, {
                  id: 6,
                  'parent': null,
                  'type': null,
                  title: 'Договор на поставку печатной продукции',
                  image: explorerImagesLayout[0],
                  isDocument: true,
                  width: 200
               }, {
                  id: 7,
                  'parent': null,
                  'type': null,
                  title: 'Договор аренды помещения',
                  image: explorerImagesLayout[1],
                  isDocument: true,
                  width: 200
               }, {
                  id: 8,
                  'parent': null,
                  'type': null,
                  title: 'Конфеты',
                  image: explorerImagesLayout[3],
                  width: 300
               }, {
                  id: 9,
                  'parent': null,
                  'type': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true,
                  width: 200
               }]
            });
         }
      });

   return ModuleClass;
});
