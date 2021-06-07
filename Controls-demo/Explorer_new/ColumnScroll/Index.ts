import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/ColumnScroll/ColumnScroll';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import { TRoot, IHeader } from 'Controls-demo/types';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: MemorySource;
   protected _columns: unknown = Gadgets.getGridColumnsForScroll();
   protected _viewMode: string = 'table';
   protected _root: TRoot = null;
   protected _header: IHeader[] = [...Gadgets.getHeader(),  {title: 'Подрядчик'}];

   protected _beforeMount(): void {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
