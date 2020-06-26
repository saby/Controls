import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/EditArrow/EditArrow';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { TRoot } from 'Controls-demo/types';
import {SyntheticEvent} from 'Vdom/Vdom';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: MemorySource;
   protected _columns: IColumn[] = Gadgets.getColumns();
   protected _viewMode: string = 'table';
   protected _root: TRoot = null;
   private _isBoxOpen: boolean = false;
   protected _currentText: string = '';

   protected _beforeMount(): void {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }

   protected _editArrowClick(_: SyntheticEvent, item: any): void {
      if (!this._isBoxOpen) {
         this._currentText = `Arrow was Clicked from item id: ${item.getId()}`
         this._isBoxOpen = true;
         this._hideBox();
      } else {
         this._currentText = `Arrow was Clicked from item id: ${item.getId()}`
      }
   }

   private _hideBox(): void {
      setTimeout(() => {
         this._isBoxOpen = false;
      }, 2000);
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
