import {Control, TemplateFunction} from 'UI/Base';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {TBeforeMoveCallback} from 'Controls/list';
import {IColumn} from 'Controls/grid';
import {ISelectionObject} from 'Controls/interface';
import {Model} from 'Types/entity';

import {Gadgets} from '../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/treeGridNew/MoveController/BeforeMoveCallback/BeforeMoveCallback';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: IColumn[];
   protected _beforeMoveCallback: TBeforeMoveCallback;

   protected _beforeMount(): void {
      this._columns = [{
         displayProperty: 'title',
         width: ''
      }];
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         data: Gadgets.getFlatData(),
         parentProperty: 'parent'
      });
      this._beforeMoveCallback = this.__beforeMoveCallback.bind(this);
   }

   protected __beforeMoveCallback(selection: ISelectionObject, target: Model | CrudEntityKey): Promise<void> {
      return new Promise((resolve, reject) => {
         setTimeout(() => {
            if (target.getKey() === 2) {
               const config = {
                  target: this._children.treeGrid,
                  message: 'Cannot move to the folder #2'
               };

               this._notify('openInfoBox', [config], {bubbling: true});
               reject();
            } else {
               resolve();
            }
         }, 1000);
      });
   }

   protected _moveButtonClick(): void {
      if (this._selectedKeys.length) {
         const selection: ISelectionObject = {
            selected: this._selectedKeys,
            excluded: this._excludedKeys
         };
         this._children.treeGrid.moveItemsWithDialog(selection)
             .then(() => {
                  this._children.treeGrid.reload();
              })
             .catch(() => {});
      }
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
