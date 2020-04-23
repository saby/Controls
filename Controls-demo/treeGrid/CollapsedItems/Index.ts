import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/CollapsedItems/CollapsedItems"
import {Memory} from "Types/source"
import {Gadgets} from "../DemoHelpers/DataCatalog"


export default class extends Control {
   protected _template: TemplateFunction = Template;
   static _styles: string[] = ['Controls-demo/Controls-demo'];
   protected _viewSource: Memory;
   protected _columns = Gadgets.getColumnsForFlat();
   protected _collapsedItems = [1];
   protected _expandedItems = [null];

   protected _beforeMount() {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getDataSet()
      });
   }
}
