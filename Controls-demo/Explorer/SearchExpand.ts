import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as ExplorerMemory from 'Controls-demo/Explorer/ExplorerMemory';
import * as template from 'wml!Controls-demo/Explorer/SearchExpand';


interface ISearchExpandData {
   id: number;
   parent: number;
   'parent@': boolean;
   code: string;
   price: number;
   title: string;
}

interface ISearchExpandColumn {
   displayProperty: string;
   width: string;
}

const data: ISearchExpandData[] =  [
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
];

const columns: ISearchExpandColumn[] = [
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

export default class SearchExpand extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   static _styles: string[] = ['Controls-demo/Explorer/Search'];
   protected _markedKey: number = 1;
   protected _excludedKeys: [] = [];
   protected _selectedKeys: [] = [];
   protected _viewSource: ExplorerMemory;
   protected _viewColumns: ISearchExpandColumn[];
   protected _filter: object;
   protected _expandedItems: any;
   protected _searchStartingWith: string = 'root';
   protected _multiselectVisibility: string = 'visible';

   protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
      this._viewColumns = columns;
      this._filter = {
         demo: 123
      };
      this._viewSource = new ExplorerMemory({
         keyProperty: 'id',
         data
      });
   }

   protected _markedKeyChangedHandler(e: SyntheticEvent, markedKey: string): void {
      console.log('markedKey: ', markedKey);
   }
}
