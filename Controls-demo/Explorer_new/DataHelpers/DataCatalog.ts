import * as explorerImages from 'Controls-demo/Explorer/ExplorerImages';
import * as editingColumnTemplate from 'wml!Controls-demo/Explorer/Editing/editingCellTemplate'
import * as notEditableTemplate from 'wml!Controls-demo/Explorer/Editing/notEditableCell'

export const Gadgets = {
   getData: () => [{
   id: 1,
   'parent': null,
   'parent@': true,
   title: 'Документы отделов',
   discr: '5',
   price: 123
}, {
   id: 11,
   'parent': 1,
   'parent@': true,
   title: '1. Электронный документооборот',
   discr: '5',
   price: 123
}, {
   id: 12,
   'parent': 1,
   'parent@': true,
   title: '2. Отчетность через интернет',
   discr: '5',
   price: 123
},{
   id: 121,
   'parent': 12,
   'parent@': true,
   title: 'Papo4ka',
      discr: '5',
      price: 123
},
   {
      id: 1211,
      'parent': 121,
      'parent@': true,
      title: 'Doc1',
      isDocument: true,
      discr: '5',
      price: 123
   },
   {
      id: 1212,
      'parent': 121,
      'parent@': true,
      title: 'Doc12',
      isDocument: true,
      discr: '5',
      price: 123
   },
   {
      id: 122,
      'parent': 12,
      'parent@': true,
      title: 'Papo4ka2',
      discr: '5',
      price: 123
   },
   {
      id: 13,
      'parent': 1,
      'parent@': null,
      title: 'Сравнение условий конкурентов по ЭДО.xlsx',
      isDocument: true,
      discr: '5',
      price: 123
   }, {
      id: 14,
      'parent': 1,
      'parent@': null,
      title: 'Сравнение условий конкурентов по ЭДО.xlsx',
      isDocument: true,
         discr: '5',
         price: 123
   }, {
      id: 15,
      'parent': 1,
      'parent@': null,
      title: 'Сравнение условий конкурентов по ЭДО.xlsx',
      isDocument: true,
         discr: '5',
         price: 123
   }, {
      id: 16,
      'parent': 1,
      'parent@': null,
      title: 'Сравнение условий конкурентов по ЭДО.xlsx',
      isDocument: true,
         discr: '5',
         price: 123
   }, {
      id: 17,
      'parent': 1,
      'parent@': null,
      title: 'Сравнение условий конкурентов по ЭДО.xlsx',
      isDocument: true,
         discr: '5',
         price: 123
   }, {
      id: 18,
      'parent': 1,
      'parent@': null,
      title: 'Сравнение условий конкурентов по ЭДО.xlsx',
      isDocument: true,
         discr: '5',
         price: 123
   }, {
      id: 19,
      'parent': 1,
      'parent@': null,
      title: 'Сравнение условий конкурентов по ЭДО.xlsx',
      isDocument: true,
         discr: '5',
         price: 123
   }, {
      id: 111,
      'parent': 11,
      'parent@': true,
      title: 'Задачи',
         discr: '5',
         price: 123
   }, {
      id: 112,
      'parent': 11,
      'parent@': null,
      title: 'Сравнение систем по учету рабочего времени.xlsx',
      isDocument: true,
         discr: '5',
         price: 123
   }, {
      id: 2,
      'parent': null,
      'parent@': true,
      title: 'Техническое задание',
         discr: '5',
         price: 123
   }, {
      id: 21,
      'parent': 2,
      'parent@': null,
      title: 'PandaDoc.docx',
      isDocument: true,
         discr: '5',
         price: 123
   }, {
      id: 22,
      'parent': 2,
      'parent@': null,
      title: 'SignEasy.docx',
      isDocument: true,
         discr: '5',
         price: 123
   }, {
      id: 3,
      'parent': null,
      'parent@': true,
      title: 'Анализ конкурентов',
         discr: '5',
         price: 123
   }, {
      id: 4,
      'parent': null,
      'parent@': null,
      title: 'Договор на поставку печатной продукции',
      isDocument: true,
         discr: '5',
         price: 123
   }, {
      id: 5,
      'parent': null,
      'parent@': null,
      title: 'Договор аренды помещения',
      isDocument: true,
         discr: '5',
         price: 123
   }, {
      id: 6,
      'parent': null,
      'parent@': null,
      title: 'Конфеты',
         discr: '5',
         price: 123
   }, {
      id: 82,
      'parent': null,
      'parent@': null,
      title: 'Скриншот от 25.12.16, 11-37-16',
      isDocument: true,
         discr: '5',
         price: 123,
         image: explorerImages[1]
   }, {
      id: 83,
      'parent': null,
      'parent@': null,
      title: 'Скриншот от 25.12.16, 11-37-16',
      isDocument: true,
         discr: '5',
         price: 123,
         image: explorerImages[2]
   }, {
      id: 84,
      'parent': null,
      'parent@': null,
      title: 'Скриншот от 25.12.16, 11-37-16',
      isDocument: true,
         discr: '5',
         price: 123,
         image: explorerImages[3]
   }, {
      id: 85,
      'parent': null,
      'parent@': null,
      title: 'Скриншот от 25.12.16, 11-37-16',
      isDocument: true,
         discr: '5',
         price: 123,
         image: explorerImages[4]
   }, {
      id: 86,
      'parent': null,
      'parent@': null,
      title: 'Скриншот от 25.12.16, 11-37-16',
      isDocument: true,
      discr: '5',
      price: 123,
      image: explorerImages[5]
   }],

   getColumns: () => [
      {
         displayProperty: 'title',
         width: '1fr'
      }
   ],

   getGridColumns: () => [
      {
         displayProperty: 'title',
         width: '200px'
      },
      {
         displayProperty: 'discr',
         width: '1fr'
      },
      {
         displayProperty: 'price',
         width: '1fr'
      }
   ],
   getGridEditingCol: () => [
      {
         displayProperty: 'title',
         width: '200px',
         template: editingColumnTemplate
      },
      {
         displayProperty: 'discr',
         width: '1fr',
         template: notEditableTemplate,
      },
   ],

   getGridColumnsForScroll: () => [
      {
         displayProperty: 'id',
         width: '150px'
      },
      {
         displayProperty: 'title',
         width: '200px',
         align: 'right'
      },
      {
         displayProperty: 'discr',
         width: '200px',
         align: 'right'

      },
      {
         displayProperty: 'price',
         width: '200px',
         align: 'right'

      }
   ],

   getHeader() {
      return [
         {
            title: ''
         },
         {
            title: 'Рейтинг покупателей'
         },
         {
            title: 'Страна производитель'
         }
      ]
   },

   getSearchData() {
      return [
         {
            id: 1, 'parent': null, 'parent@': true, code: null, price: null, title: 'Комплектующие'
         },
         {
            id: 11, 'parent': 1, 'parent@': true, code: null, price: null, title: 'Жесткие диски'
         },
         {
            id: 111, 'parent': 11, 'parent@': true, code: null, price: null, title: 'SATA'
         },
         {
            id: 1111, 'parent': 111, 'parent@': null, code: 'ST1000NC001', price: 2800,
            title: 'Жесткий диск Seagate Original SATA-III 1Tb ST1000NC001 Constellation СS (7200rpm) 64Mb 3.5'
         },
         {
            id: 1112, 'parent': 111, 'parent@': null, code: 'ST1100DX001', price: 3750,
            title: 'Жесткий диск Seagate Original SATA-III 2Tb ST2000DX001 Desktop SSHD (7200rpm) 64Mb 3.5'
         },
         {
            id: 1113, 'parent': 111, 'parent@': null, code: 'ST2300CD001', price: 6500,
            title: 'Жесткий диск Seagate Original SATA-III 2Tb ST2000NC001 Constellation СS (7200rpm) 64Mb 3.5'
         },/*
                  {
                     id: 1, 'parent': null, 'parent@': true, code: null, price: null, title: 'Комплектующие'
                  },
                  {
                     id: 11, 'parent': 1, 'parent@': true, code: null, price: null, title: 'Жесткие диски'
                  },*/
         {
            id: 112, 'parent': 11, 'parent@': true, code: null, price: null, title: 'SAS'
         },
         {
            id: 1121, 'parent': 112, 'parent@': null, code: 'ST1000NC001', price: 3600,
            title: 'Жесткий диск Seagate Original SAS SATA-III 1Tb ST1000NC001 Constellation СS (7200rpm) 64Mb 3.5'
         },
         {
            id: 1122, 'parent': 112, 'parent@': null, code: 'ST1100DX001', price: 4870,
            title: 'Жесткий диск Seagate Original SAS SATA-III 2Tb ST2000DX001 Desktop SSHD (7200rpm) 64Mb 3.5'
         },
         {
            id: 1123, 'parent': 112, 'parent@': null, code: 'ST2300CD001', price: 5250,
            title: 'Жесткий диск Seagate Original SAS SATA-III 2Tb ST2000NC001 Constellation СS (7200rpm) 64Mb 3.5'
         },
         {
            id: 2, 'parent': null, 'parent@': true, code: null, price: null, title: 'Компьютеры'
         },
         {
            id: 21, 'parent': 2, 'parent@': true, code: null, price: null, title: 'Аксессуары'
         },
         {
            id: 211, 'parent': 21, 'parent@': true, code: null, price: null, title: 'Аксессуары для SATA'
         },
         {
            id: 3, 'parent': null, 'parent@': true, code: null, price: null, title: 'Комплектующие для настольных персональных компьютеров фирмы "Формоза компьютерс"'
         },
         {
            id: 31, 'parent': 3, 'parent@': true, code: null, price: null, title: 'Бывшие в употреблении'
         },
         {
            id: 311, 'parent': 31, 'parent@': true, code: null, price: null, title: 'Восстановленные детали'
         },
         {
            id: 3111, 'parent': 311, 'parent@': true, code: null, price: null, title: 'Жесткие диски SATA'
         },
         {
            id: 4, 'parent': null, 'parent@': true, code: null, price: null, title: 'Цифровое фото и видео'
         },
         {
            id: 41, 'parent': 4, 'parent@': true, code: null, price: null, title: 'Фотоаппараты'
         },
         {
            id: 411, 'parent': 41, 'parent@': true, code: null, price: null, title: 'Canon'
         },
         {
            id: 4111, 'parent': 411, 'parent@': null, code: 'FR-11434', price: 49500,
            title: 'Canon EOS 7D Body SATA support'
         },
         {
            id: 4112, 'parent': 411, 'parent@': null, code: 'FT-13453', price: 144180,
            title: 'Canon EOS 5D Mark III Body SATA support'
         },
         {
            id: 5, 'parent': null, 'parent@': null, code: 'FT-13352', price: 112360,
            title: 'Canon EOS 5D Mark II Body SATA support'
         }
      ];
   },
   getSearchColumns() {
      return [
         {
            displayProperty: 'title',
            width: '1fr'
         },
         {
            displayProperty: 'code',
            width: '150px'
         },
         {
            displayProperty: 'price',
            width: '150px'
         }
      ];
   }
}
