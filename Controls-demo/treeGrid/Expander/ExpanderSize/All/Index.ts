import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/Expander/ExpanderSize/All/All"
import {Memory} from "Types/source"
import {Gadgets} from "../../../DemoHelpers/DataCatalog"


export default class extends Control {
   protected _template: TemplateFunction = Template;
   static _styles: string[] = ['Controls-demo/Controls-demo'];
   protected _viewSource: Memory;
   protected _columns = Gadgets.getColumnsForFlat();
   protected _expandedItems = [null];
   protected _expandedItemsS = [null];
   protected _expandedItemsM = [null];
   protected _expandedItemsL = [null];
   protected _expandedItemsXl = [null];


   protected _beforeMount() {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getDataSet(),
         filter: () => true,
      });
   }
}
