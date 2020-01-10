import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/Multiselect/Multiselect';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';

import 'css!Controls-demo/Controls-demo';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   private _viewSource;
   private _columns = Gadgets.getGridColumns();
   private _viewMode: string = 'table';
   private _root = null;
   private _multiselect: 'visible'|'hidden'|'onhover' = 'visible';
   private _header = Gadgets.getHeader();

   protected _beforeMount() {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }

   private _onToggle() {
      switch (this._multiselect) {
         case 'visible':
            this._multiselect = 'hidden';
            break;
         case 'hidden':
            this._multiselect = 'onhover';
            break;
         case 'onhover':
            this._multiselect = 'visible';
            break;
      }
      this._forceUpdate();
   }
}
