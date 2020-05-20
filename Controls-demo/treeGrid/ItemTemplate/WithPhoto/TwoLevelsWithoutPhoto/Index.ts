import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/ItemTemplate/WithPhoto/TwoLevelsWithoutPhoto/TwoLevelsWithoutPhoto";
import {Memory} from "Types/source"
import {Gadgets} from "../../../DemoHelpers/DataCatalog"



export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _expandedItems: number[] = [1, 2, 4];
   protected _twoLvlColumnsNoPhoto = Gadgets.getGridTwoLevelColumnsWithPhoto().map((cur) => ({
      ...cur, template: undefined
   }));

   protected _beforeMount(options): void {
      if (options.hasOwnProperty('collapseNodes')) {
         this._expandedItems = [];
      }
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getDataTwoLvl()
      });
   }

   static _styles: string[] = ['Controls-demo/treeGrid/ItemTemplate/WithPhoto/styles', 'Controls-demo/Controls-demo'];
}
