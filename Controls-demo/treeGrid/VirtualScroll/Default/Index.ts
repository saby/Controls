import {Control, TemplateFunction} from 'UI/Base';
import * as Template from "wml!Controls-demo/treeGrid/VirtualScroll/Default/Default";
import {Memory} from 'Types/source';
import {Gadgets, VirtualScrollHasMore} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = Gadgets.getGridColumnsForFlat();

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: VirtualScrollHasMore.getDataForVirtual()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
