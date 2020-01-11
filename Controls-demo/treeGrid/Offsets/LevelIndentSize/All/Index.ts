import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/Offsets/LevelIndentSize/All/All"
import {Memory} from "Types/source"
import {Gadgets} from "../../../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
   protected _template: TemplateFunction = Template;
   private _viewSource: Memory;
   private _columns = Gadgets.getColumnsForFlat();
   private _expandedItems = [1];
   private _expandedItemsS = [1, 11, 12, 13, 14, 15, 16, 153];
   private _expandedItemsM = [1];
   private _expandedItemsL = [1];
   private _expandedItemsXl = [1];

   protected _beforeMount() {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getFlatData(),
         filter: () => true,
      });
   }
}
