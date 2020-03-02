import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/EditArrow/EditArrow';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';

import 'css!Controls-demo/Controls-demo';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource;
   protected _columns = Gadgets.getColumns();
   protected _viewMode: string = 'table';
   protected _root = null;
   private _isBoxOpen = false;
   protected _currentText = '';

   protected _beforeMount() {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }

   protected _editArrowClick(e,item) {
      if (!this._isBoxOpen) {
         this._currentText = `Arrow was Clicked from item id: ${item.getId()}`
         this._isBoxOpen = true;
         this._hideBox();
      } else {
         this._currentText = `Arrow was Clicked from item id: ${item.getId()}`
      }
   }

   private _hideBox() {
      setTimeout(() => {
         this._isBoxOpen = false;
      }, 2000);
   }
}
