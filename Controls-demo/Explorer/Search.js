define('Controls-demo/Explorer/Search', [
   'Core/Control',
   'wml!Controls-demo/Explorer/Search',
   'Controls-demo/Explorer/ExplorerMemory',
   'Types/source',
   'Controls/explorer'
], function(BaseControl, template, MemorySource, source) {
   'use strict';
   var
      ModuleClass = BaseControl.extend({
         _template: template,
         _styles: ['Controls-demo/Explorer/Search'],
         _markedKey: 1,
         _excludedKeys: [],
         _selectedKeys: [],
         _viewSource: null,
         _viewColumns: null,
         _filter: { demo: 123 },
         _title: '',
         _searchStartingWith: 'root',
         _multiselectVisibility: 'visible',
         _beforeMount: function() {
            this._viewColumns = [
               {
                  displayProperty: 'title',
                  width: 'auto'
               },
               {
                  displayProperty: 'code',
                  width: '200px'
               },
               {
                  displayProperty: 'price',
                  width: '150px'
               }
            ];
            this._searchStartingWithSource = new source.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: 'root', title: 'root'
                  },
                  {
                     id: 'current', title: 'current'
                  }
               ]
            });
            this._multiselectVisibilitySource = new source.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: 'visible', title: 'visible'
                  },
                  {
                     id: 'onhover', title: 'onhover'
                  },
                  {
                     id: 'hidden', title: 'hidden'
                  }
               ]
            });
            this._viewSource = new MemorySource({
               keyProperty: 'id',
               data: [
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
               ]
            });
         }
      });

   return ModuleClass;
});
