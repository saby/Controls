import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/ChangeRoot/ChangeRoot';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';

import 'css!Controls-demo/Controls-demo';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource;
   protected _columns = Gadgets.getColumns();
   protected _viewMode: string = 'table';
   private _root = null;

   protected _beforeMount() {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }

   protected _onToggleRoot() {
      if (this._root === null) {
         this._root = 1;
      } else {
         this._root = null;
      }
   }
}
