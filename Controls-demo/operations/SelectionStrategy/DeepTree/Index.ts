import {Control, TemplateFunction} from 'UI/Base'
import * as Template from 'wml!Controls-demo/operations/SelectionStrategy/DeepTree/DeepTree'
import Memory from 'Controls-demo/resources/Memory/TreeMemory'
import employeesData from 'Controls-demo/resources/Data/Employees'
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
         data: employeesData
      });
   }

   protected _dataLoadCallback() {
      let entryPath = employeesData.map((employeeData) => {
         return {
            id: employeeData.id,
            parent: employeeData['Раздел']
         }
      });

      this.items.setMetaData({
         ENTRY_PATH: entryPath
      });
   }
}
