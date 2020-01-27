import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/Expander/ExpanderSize/All/All"
import {Memory} from "Types/source"
import {Gadgets} from "../../../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
   protected _template: TemplateFunction = Template;
   private _viewSource: Memory;
   private _columns = Gadgets.getColumnsForFlat();
   private _expandedItems = [null];
   private _expandedItemsS = [null];
   private _expandedItemsM = [null];
   private _expandedItemsL = [null];
   private _expandedItemsXl = [null];


   protected _beforeMount() {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getDataSet(),
         filter: () => true,
      });
   }
}
