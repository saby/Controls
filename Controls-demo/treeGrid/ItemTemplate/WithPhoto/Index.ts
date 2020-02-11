import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/ItemTemplate/WithPhoto/WithPhoto"
import {Memory} from "Types/source"
import {Gadgets} from "../../DemoHelpers/DataCatalog"

import "css!Controls-demo/treeGrid/ItemTemplate/WithPhoto/styles";

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _viewSourceTwo: Memory;
   protected _columns = Gadgets.getGridColumnsWithPhoto();
   protected _twoLvlColumns = Gadgets.getGridTwoLevelColumnsWithPhoto();
   protected _twoLvlColumnsNoPhoto = Gadgets.getGridTwoLevelColumnsWithPhoto().map((cur) => ({
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
