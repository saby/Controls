import {Control} from 'UI/Base';
import * as template from 'wml!Controls-demo/operations/SelectionViewMode/SelectionViewMode';
import Memory from 'Controls-demo/operations/SelectionViewMode/Memory';
import {getListData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';
import 'wml!Controls-demo/operations/SelectionViewMode/resources/PersonInfo';

export default class extends Control {
   _template = template;
   _gridColumns = null;
   _viewSource = null;
   _selectionViewMode = 'all';

   _beforeMount() {
      this._gridColumns = [{
         template: 'Controls-demo/operations/SelectionViewMode/resources/PersonInfo'
      }];
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: getListData()
      });
   }

   static _styles: string[] = ['Controls-demo/operations/Index'];
}
