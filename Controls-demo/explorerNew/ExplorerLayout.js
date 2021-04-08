define('Controls-demo/Explorer/ExplorerLayout', [
   'Controls-demo/Explorer/Explorer',
   'Controls-demo/Explorer/ExplorerImagesLayout',
   'Controls-demo/Explorer/ExplorerMemory',
], function(Explorer, explorerImagesLayout, MemorySource) {
   'use strict';
   var
      ModuleClass = Explorer.extend({
         _beforeMount: function() {
            ModuleClass.superclass._beforeMount.apply(this, arguments);
            this._viewSource = new MemorySource({
               keyProperty: 'id',
               data: [{
                  id: 1,
                  'parent': null,
                  'parent@': true,
                  title: 'Документы отделов'
               }, {
                  id: 11,
                  'parent': 1,
                  'parent@': true,
                  title: '1. Электронный документооборот'
               }, {
                  id: 12,
                  'parent': 1,
                  'parent@': true,
                  title: '2. Отчетность через интернет'
               },{
                  id: 121,
                  'parent': 12,
                  'parent@': true,
                  title: 'Papo4ka',
                  image: explorerImagesLayout[4],
               },
                  {
                     id: 1211,
                     'parent': 121,
                     'parent@': true,
                     title: 'Doc1',
                     image: explorerImagesLayout[4],
                     isDocument: true
                  },
                  {
                     id: 1212,
                     'parent': 121,
                     'parent@': true,
                     title: 'Doc12',
                     image: explorerImagesLayout[4],
                     isDocument: true
                  },
                  {
                     id: 122,
                     'parent': 12,
                     'parent@': true,
                     title: 'Papo4ka2',
                     image: explorerImagesLayout[4],
                  },
                  {
                  id: 13,
                  'parent': 1,
                  'parent@': null,
                  title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                  image: explorerImagesLayout[4],
                  isDocument: true
               }, {
                  id: 14,
                  'parent': 1,
                  'parent@': null,
                  title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                  image: explorerImagesLayout[4],
                  isDocument: true
               }, {
                  id: 15,
                  'parent': 1,
                  'parent@': null,
                  title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                  image: explorerImagesLayout[4],
                  isDocument: true
               }, {
                  id: 16,
                  'parent': 1,
                  'parent@': null,
                  title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                  image: explorerImagesLayout[4],
                  isDocument: true
               }, {
                  id: 17,
                  'parent': 1,
                  'parent@': null,
                  title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                  image: explorerImagesLayout[4],
                  isDocument: true
               }, {
                  id: 18,
                  'parent': 1,
                  'parent@': null,
                  title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                  image: explorerImagesLayout[4],
                  isDocument: true
               }, {
                  id: 19,
                  'parent': 1,
                  'parent@': null,
                  title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                  image: explorerImagesLayout[4],
                  isDocument: true
               }, {
                  id: 111,
                  'parent': 11,
                  'parent@': true,
                  title: 'Задачи'
               }, {
                  id: 112,
                  'parent': 11,
                  'parent@': null,
                  title: 'Сравнение систем по учету рабочего времени.xlsx',
                  image: explorerImagesLayout[5],
                  isDocument: true
               }, {
                  id: 2,
                  'parent': null,
                  'parent@': true,
                  title: 'Техническое задание'
               }, {
                  id: 21,
                  'parent': 2,
                  'parent@': null,
                  title: 'PandaDoc.docx',
                  image: explorerImagesLayout[6],
                  isDocument: true
               }, {
                  id: 22,
                  'parent': 2,
                  'parent@': null,
                  title: 'SignEasy.docx',
                  image: explorerImagesLayout[7],
                  isDocument: true
               }, {
                  id: 3,
                  'parent': null,
                  'parent@': true,
                  title: 'Анализ конкурентов'
               }, {
                  id: 4,
                  'parent': null,
                  'parent@': null,
                  title: 'Договор на поставку печатной продукции',
                  image: explorerImagesLayout[0],
                  isDocument: true
               }, {
                  id: 5,
                  'parent': null,
                  'parent@': null,
                  title: 'Договор аренды помещения',
                  image: explorerImagesLayout[1],
                  isDocument: true
               }, {
                  id: 6,
                  'parent': null,
                  'parent@': null,
                  title: 'Конфеты',
                  image: explorerImagesLayout[3]

               }, {
                  id: 7,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 71,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 72,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 73,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 74,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 75,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 76,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 77,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 78,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 79,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 80,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 81,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 82,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 83,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 84,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 85,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }, {
                  id: 86,
                  'parent': null,
                  'parent@': null,
                  title: 'Скриншот от 25.12.16, 11-37-16',
                  image: explorerImagesLayout[2],
                  isDocument: true
               }]
            });
         }
      });

   return ModuleClass;
});
