import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/EditArrowVisibilityCallback/EditArrowVisibilityCallback';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import { IColumn } from 'Controls/grid';
import { TRoot } from 'Controls-demo/types';
import {SyntheticEvent} from 'Vdom/Vdom';

interface IItem {
   getId: () => string;
}

const TIMEOUT = 2000;

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
   protected _editArrowVisibilityCallback(item) {
      if (item.get('parent@')) {
         return true;
      }
   }

   protected _editArrowClick(_: SyntheticEvent, item: IItem): void {
      if (!this._isBoxOpen) {
         this._currentText = `Arrow was Clicked from item id: ${item.getId()}`;
         this._isBoxOpen = true;
         this._hideBox();
      } else {
         this._currentText = `Arrow was Clicked from item id: ${item.getId()}`;
      }
   }

   private _hideBox(): void {
      setTimeout(() => {
         this._isBoxOpen = false;
      }, TIMEOUT);
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
