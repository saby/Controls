import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/ItemTemplate/WithPhoto/Photo24px/Photo24px";
import {Memory} from "Types/source"
import {Gadgets} from "../../../DemoHelpers/DataCatalog"

import "css!Controls-demo/treeGrid/ItemTemplate/WithPhoto/styles";

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns = Gadgets.getGridColumnsWithPhoto();
   protected _expandedItems: number[] = [ 1, 15, 153 ];

   protected _beforeMount(options): void {
      if (options.hasOwnProperty('collapseNodes')) {
         this._expandedItems = [];
      }
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getFlatData()
      });
   }
}
