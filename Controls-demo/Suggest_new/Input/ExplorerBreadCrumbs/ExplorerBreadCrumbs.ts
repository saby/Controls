import {Control, TemplateFunction} from 'UI/Base';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/ExplorerBreadCrumbs/ExplorerBreadCrumbs');
import suggestTemplate = require('wml!Controls-demo/Suggest_new/Input/ExplorerBreadCrumbs/resources/SuggestTemplate');

export default class extends Control {
   protected _template: TemplateFunction = controlTemplate;
   protected _suggestTemplate: TemplateFunction = suggestTemplate;

   private _source: typeof MemorySource;

   protected _markedKey: number;
   protected _viewColumns: object[];

   protected _beforeMount(): void {
      this._markedKey = 1;
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

      this._source = new MemorySource({
         keyProperty: 'id',
         data: [
            {
               id: 1, parent: null, 'parent@': true, code: null, price: null, title: 'Комплектующие'
            },
            {
               id: 11, parent: 1, 'parent@': true, code: null, price: null, title: 'Жесткие диски'
            },
            {
               id: 111, parent: 11, 'parent@': true, code: null, price: null, title: 'SATA'
            },
            {
               id: 1111, parent: 111, 'parent@': null, code: 'ST1000NC001', price: 2800,
               title: 'Жесткий диск Seagate Original SATA-III 1Tb ST1000NC001 Constellation СS (7200rpm) 64Mb 3.5'
            },
            {
               id: 1112, parent: 111, 'parent@': null, code: 'ST1100DX001', price: 3750,
               title: 'Жесткий диск Seagate Original SATA-III 2Tb ST2000DX001 Desktop SSHD (7200rpm) 64Mb 3.5'
            },
            {
               id: 1113, parent: 111, 'parent@': null, code: 'ST2300CD001', price: 6500,
               title: 'Жесткий диск Seagate Original SATA-III 2Tb ST2000NC001 Constellation СS (7200rpm) 64Mb 3.5'
            },
            {
               id: 112, parent: 11, 'parent@': true, code: null, price: null, title: 'SAS'
            },
            {
               id: 1121, parent: 112, 'parent@': null, code: 'ST1000NC001', price: 3600,
               title: 'Жесткий диск Seagate Original SAS SATA-III 1Tb ST1000NC001 Constellation СS (7200rpm) 64Mb 3.5'
            },
            {
               id: 1122, parent: 112, 'parent@': null, code: 'ST1100DX001', price: 4870,
               title: 'Жесткий диск Seagate Original SAS SATA-III 2Tb ST2000DX001 Desktop SSHD (7200rpm) 64Mb 3.5'
            },
            {
               id: 1123, parent: 112, 'parent@': null, code: 'ST2300CD001', price: 5250,
               title: 'Жесткий диск Seagate Original SAS SATA-III 2Tb ST2000NC001 Constellation СS (7200rpm) 64Mb 3.5'
            },
            {
               id: 2, parent: null, 'parent@': true, code: null, price: null, title: 'Компьютеры'
            },
            {
               id: 21, parent: 2, 'parent@': true, code: null, price: null, title: 'Аксессуары'
            },
            {
               id: 211, parent: 21, 'parent@': true, code: null, price: null, title: 'Аксессуары для SATA'
            },
            {
               id: 3, parent: null, 'parent@': true, code: null, price: null, title: 'Комплектующие для настольных персональных компьютеров фирмы "Формоза компьютерс"'
            },
            {
               id: 31, parent: 3, 'parent@': true, code: null, price: null, title: 'Бывшие в употреблении'
            },
            {
               id: 311, parent: 31, 'parent@': true, code: null, price: null, title: 'Восстановленные детали'
            },
            {
               id: 3111, parent: 311, 'parent@': true, code: null, price: null, title: 'Жесткие диски SATA'
            },
            {
               id: 4, parent: null, 'parent@': true, code: null, price: null, title: 'Цифровое фото и видео'
            },
            {
               id: 41, parent: 4, 'parent@': true, code: null, price: null, title: 'Фотоаппараты'
            },
            {
               id: 411, parent: 41, 'parent@': true, code: null, price: null, title: 'Canon'
            },
            {
               id: 4111, parent: 411, 'parent@': null, code: 'FR-11434', price: 49500,
               title: 'Canon EOS 7D Body SATA support'
            },
            {
               id: 4112, parent: 411, 'parent@': null, code: 'FT-13453', price: 144180,
               title: 'Canon EOS 5D Mark III Body SATA support'
            },
            {
               id: 5, parent: null, 'parent@': null, code: 'FT-13352', price: 112360,
               title: 'Canon EOS 5D Mark II Body SATA support'
            }
         ]
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
