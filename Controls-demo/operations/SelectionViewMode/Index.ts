import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/operations/SelectionViewMode/SelectionViewMode';
import Memory from 'Controls-demo/operations/SelectionViewMode/Memory';
import {getListData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';
import 'wml!Controls-demo/OperationsPanel/Demo/PersonInfo';
import 'css!Controls-demo/OperationsPanel/Demo/Demo';

export default class extends Control {
   _template = template;
   _gridColumns = null;
   _viewSource = null;
   _selectionViewMode = 'all';

   _beforeMount() {
      this._gridColumns = [{
         template: 'wml!Controls-demo/OperationsPanel/Demo/PersonInfo'
      }];
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: getListData()
      });
   }
}