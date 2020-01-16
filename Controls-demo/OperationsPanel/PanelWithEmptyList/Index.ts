import PanelWithList from 'Controls-demo/OperationsPanel/PanelWithList/Index';
import TreeMemory = require('Controls-demo/List/Tree/TreeMemory');

export default class extends PanelWithList {
   _beforeMount() {
      super._beforeMount();
      this._viewSource = new TreeMemory({
         keyProperty: 'id',
         data: []
      });
   }
}
