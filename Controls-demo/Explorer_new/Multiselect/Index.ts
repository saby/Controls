import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/Multiselect/Multiselect';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';


export default class extends Control {
   protected _template: TemplateFunction = Template;
   static _styles: string[] = ['Controls-demo/Controls-demo'];
   protected _viewSource;
   protected _columns = Gadgets.getGridColumns();
   protected _viewMode: string = 'table';
   protected _root = null;
   private _multiselect: 'visible'|'hidden'|'onhover' = 'visible';
   protected _header = Gadgets.getHeader();

   protected _beforeMount() {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }

   protected _onToggle() {
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
