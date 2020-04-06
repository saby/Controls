import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/ColumnScroll/ColumnScroll';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';

import 'css!Controls-demo/Controls-demo';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource;
   protected _columns = Gadgets.getGridColumnsForScroll();
   protected _viewMode: string = 'table';
   protected _root = null;
   protected _header = [...Gadgets.getHeader(),  {title: 'Подрядчик'}];

   protected _beforeMount() {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }
}
