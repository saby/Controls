import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/ItemTemplate/WithPhoto/TwoLevelsWithPhoto/TwoLevelsWithPhoto";
import {Memory} from "Types/source"
import {Gadgets} from "../../../DemoHelpers/DataCatalog"



export default class extends Control {
   protected _template: TemplateFunction = Template;
   static _styles: string[] = ['Controls-demo/treeGrid/ItemTemplate/WithPhoto/styles', 'Controls-demo/Controls-demo'];
   protected _viewSourceTwo: Memory;
   protected _columns = Gadgets.getGridColumnsWithPhoto();
   protected _twoLvlColumns = Gadgets.getGridTwoLevelColumnsWithPhoto();
   protected _expandedItems = [1, 2, 4];

   protected _beforeMount(options): void {
      if (options.hasOwnProperty('collapseNodes')) {
         this._expandedItems = [];
      }
      this._viewSourceTwo = new Memory({
         keyProperty: 'id',
         data: Gadgets.getDataTwoLvl()
      });

   }
}
