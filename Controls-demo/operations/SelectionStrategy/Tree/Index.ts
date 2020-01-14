import {Control, TemplateFunction} from 'UI/Base'
import * as Template from 'wml!Controls-demo/operations/SelectionStrategy/Tree/Tree'
import Memory from 'Controls-demo/resources/Memory/TreeMemory'
import Data from 'Controls-demo/resources/Data/Employees'
import 'wml!Controls-demo/operations/SelectionStrategy/resources/ItemTemplate'
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory = null;

   protected _beforeMount() {
      this._gridColumns = [{
         template: 'wml!Controls-demo/operations/SelectionStrategy/resources/ItemTemplate'
      }];

      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Data
      });
   }
}
