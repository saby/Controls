import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/VirtualScroll/Default/Default"
import {Memory} from "Types/source"
import {Gadgets, VirtualScrollHasMore} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   static _styles: string[] = ['Controls-demo/Controls-demo'];
   protected _viewSource: Memory;
   protected _columns = Gadgets.getGridColumnsForFlat();

   protected _beforeMount() {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: VirtualScrollHasMore.getDataForVirtual()
      });
   }
}
