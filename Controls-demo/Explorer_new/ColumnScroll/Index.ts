import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/ColumnScroll/ColumnScroll';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';

import 'css!Controls-demo/Controls-demo';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   private _viewSource;
   private _columns = Gadgets.getGridColumnsForScroll();
   private _viewMode: string = 'table';
   private _root = null;
   private _header = Gadgets.getHeader();

   protected _beforeMount() {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }
}
