import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/ColumnScroll/ColumnScroll';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/explorerNew/ExplorerMemory';
import { TRoot } from 'Controls-demo/types';
import { IHeaderCell } from 'Controls/grid';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: MemorySource;
   protected _columns: unknown = Gadgets.getGridColumnsForScroll();
   protected _viewMode: string = 'table';
   protected _root: TRoot = null;
   protected _header: IHeaderCell[] = [...Gadgets.getHeader(),  {title: 'Подрядчик'}];

   protected _beforeMount(): void {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
