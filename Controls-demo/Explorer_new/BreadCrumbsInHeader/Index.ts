import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/BreadCrumbsInHeader/BreadCrumbsInHeader';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';


export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource;
   protected _columns = Gadgets.getGridColumns();
   protected _viewMode: string = 'table';
   protected _root = 1;
   protected _header = Gadgets.getHeader();

   protected _beforeMount() {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
