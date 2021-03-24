import DataContext = require('Core/DataContext');
import { List, RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';

export default class ControllerContext extends DataContext {
   selectedItems: List<Model> | RecordSet;
   _moduleName: string;
   constructor(selectedItems: List<Model> | RecordSet) {
      super();
      this.selectedItems = selectedItems;
   }
   setItems(newItems: List<Model> | RecordSet): void {
      this.selectedItems = newItems;
      // Core/DataContext написан на js, в итоге с него не цепляются типы
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      this.updateConsumers();
   }
}

ControllerContext.prototype._moduleName = 'Controls/_lookupPopup/__ControllerContext';
