import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/Offsets/LevelIndentSize/All/All"
import {Memory} from "Types/source"
import {Gadgets} from "../../../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns = Gadgets.getColumnsForFlat();
   protected _expandedItems = [1];
   protected _expandedItemsS = [1, 11, 12, 13, 14, 15, 16, 153];
   protected _expandedItemsM = [1];
   protected _expandedItemsL = [1];
   protected _expandedItemsXl = [1];

   protected _beforeMount() {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getFlatData(),
         filter: () => true,
      });
   }
}
