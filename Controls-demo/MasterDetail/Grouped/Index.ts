import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/MasterDetail/Grouped/Grouped';
import {Gadgets} from 'Controls-demo/Explorer_new/DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import { IColumn } from 'Controls/gridOld';
import { TRoot } from 'Controls-demo/types';
import { IHeaderCell } from 'Controls/gridOld';
import 'css!Controls/masterDetail';
import 'css!Controls/CommonClasses';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: MemorySource;
   protected _columns: IColumn[] = Gadgets.getGridColumns();
   protected _root: TRoot = null;
   protected _header: IHeaderCell[] = Gadgets.getHeader();

   protected _beforeMount(): void {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }
   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
