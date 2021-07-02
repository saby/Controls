import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/OperationsPanelNew/SelectionViewMode/SelectionViewMode';
import TreeMemory = require('Controls-demo/List/Tree/TreeMemory');
import {getListData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';
import 'wml!Controls-demo/operations/SelectionViewMode/resources/PersonInfo';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _selectionViewMode: string|null = 'all';
   protected _selectedKeys: number[] = [];
   protected _excludedKeys: number[] = [];
   protected _viewSource: TreeMemory;
   protected _gridColumns: object[];

   protected _beforeMount(): void {
      this._gridColumns = [{
         template: 'wml!Controls-demo/operations/SelectionViewMode/resources/PersonInfo'
      }];
      this._viewSource = new TreeMemory({
         keyProperty: 'id',
         data: getListData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
