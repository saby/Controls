import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/ChangeRoot/ChangeRoot';
import {Gadgets} from '../DataHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: IColumn[] = Gadgets.getColumns();
   protected _viewMode: string = 'table';
   private _root: string | number | null = null;

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: Gadgets.getData()
      });
   }

   protected _onToggleRoot(): void {
      if (this._root === null) {
         this._root = 1;
      } else {
         this._root = null;
      }
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
