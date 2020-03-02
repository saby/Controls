import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Tile/DragNDrop/DragNDrop';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';
import * as Dnd from 'Controls/dragnDrop';


import 'css!Controls-demo/Controls-demo';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource;
   protected _selectedKeys = [];
   private _itemsFirst = null;
   protected _itemsReadyCallback = this._itemsReady.bind(this);

   protected _beforeMount() {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: Gadgets.getData()
      });
   }

   private _itemsReady(items) {
      this._itemsFirst = items;
   }

   protected _dragStart(event, items) {
      var firstItem = this._itemsFirst.getRecordById(items[0]);

      return new Dnd.ItemsEntity({
         items: items,
         title: firstItem.get('title'),
         image: firstItem.get('image'),
      });
   };

   protected _dragEnd(event, entity, target, position) {
      this._children.listMover.moveItems(entity.getItems(), target, position);
   };
}
