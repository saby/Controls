import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/backgroundStyle/custom/backgroundStyleCustom';
import {Gadgets} from '../../DataHelpers/DataCatalog';
import {HierarchicalMemory, Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {TRoot} from 'Controls-demo/types';
import { IHeaderCell } from 'Controls/grid';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _viewSearchSource: HierarchicalMemory;
   protected _headerSource: HierarchicalMemory;
   protected _columns: IColumn[] = Gadgets.getSearchColumns();
   protected _headerRoot: TRoot = null;
   protected _searchRoot: TRoot = null;
   protected _root: TRoot = 1;
   protected _searchStartingWith: string = 'root';
   protected _searchStartingWithSource: Memory = null;
   protected _emptyFilter: object = {demo: 123};
   protected _filter: object = {demo: 123, title: 'Жесткий диск Seagate Original SATA-III 1Tb ST1000NC001 Constellation СS (7200rpm) 64Mb 3.5'};
   protected _header: IHeaderCell[] = [
      {
         title: ''
      },
      {
         title: 'Код'
      },
      {
         title: 'Цена'
      }
   ];

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: Gadgets.getSearchData()
      });
      this._viewSearchSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: Gadgets.getSearchDataLongFolderName()
      });
      this._headerSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: [{id: 1, parent: null, 'parent@': true, code: null, price: null, title: 'Комплектующие'}]
      });
      this._searchStartingWithSource = new Memory({
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
   }
   static _styles: string[] = [
      'Controls-demo/Controls-demo',
      'Controls-demo/explorerNew/backgroundStyle/custom/backgroundStyleCustom'
   ];
}
