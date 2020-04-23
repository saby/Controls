import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/Search/Search';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {Memory} from 'Types/source';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';


export default class extends Control {
   protected _template: TemplateFunction = Template;
   static _styles: string[] = ['Controls-demo/Controls-demo'];
   protected _viewSource;
   protected _columns = Gadgets.getSearchColumns();
   protected _root = null;
   protected _searchStartingWith: string = 'root';
   protected _searchStartingWithSource: Memory = null;
   protected _filter = { demo: 123 };

   protected _beforeMount() {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getSearchData()
      });
      this._searchStartingWithSource = new Memory({
         keyProperty: 'id',
         data: [
            {
               id: 'root', title: 'root'
            },
            {
               id: 'current', title: 'current'
            }
         ]
      });
   }
}
