import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/Multiselect/Multiselect';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import { IColumn } from 'Controls/grid';
import { TRoot, IHeader } from 'Controls-demo/types';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: MemorySource;
   protected _columns: IColumn[] = Gadgets.getGridColumns();
   protected _viewMode: string = 'table';
   protected _root: TRoot = null;
   private _multiselect: 'visible'|'hidden'|'onhover' = 'visible';
   protected _header: IHeader[] = Gadgets.getHeader();

   protected _beforeMount(): void {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }

   protected _onToggle(): void {
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

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
