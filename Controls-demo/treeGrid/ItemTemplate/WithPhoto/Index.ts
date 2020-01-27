import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/ItemTemplate/WithPhoto/WithPhoto"
import {Memory} from "Types/source"
import {Gadgets} from "../../DemoHelpers/DataCatalog"

import "css!Controls-demo/treeGrid/ItemTemplate/WithPhoto/styles";

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
   protected _template: TemplateFunction = Template;
   private _viewSource: Memory;
   private _viewSourceTwo: Memory;
   private _columns = Gadgets.getGridColumnsWithPhoto();
   private _twoLvlColumns = Gadgets.getGridTwoLevelColumnsWithPhoto();
   private _twoLvlColumnsNoPhoto = Gadgets.getGridTwoLevelColumnsWithPhoto().map((cur) => ({
      ...cur, template: undefined
   }));

   protected _beforeMount() {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getFlatData()
      });

      this._viewSourceTwo = new Memory({
         keyProperty: 'id',
         data: Gadgets.getDataTwoLvl()
      });

   }
}
