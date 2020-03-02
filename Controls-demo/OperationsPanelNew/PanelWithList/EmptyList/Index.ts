import PanelWithList from 'Controls-demo/OperationsPanelNew/PanelWithList/Default/Index';
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
