import {Control, TemplateFunction} from 'UI/Base'
import * as Template from 'wml!Controls-demo/operations/SelectionStrategy/Flat/Flat'
import {Memory} from 'Types/source';
import Data from 'Controls-demo/resources/Data/Employees'
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory = null;

   protected _beforeMount() {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Data
      });
   }
}
