import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Tile/DragNDrop/DragNDrop';
import {RecordSet} from 'Types/collection';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';
import * as Dnd from 'Controls/dragnDrop';
import { TItemsReadyCallback } from 'Controls-demo/types';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _selectedKeys: Number[] = [];
   private _itemsFirst: any = null;
   protected _itemsReadyCallback: TItemsReadyCallback = this._itemsReady.bind(this);

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: Gadgets.getData()
      });
   }

   private _itemsReady(items: RecordSet): void {
      this._itemsFirst = items;
   }

   protected _dragStart(_, items: number[]): RecordSet {
      var firstItem = this._itemsFirst.getRecordById(items[0]);

      return new Dnd.ItemsEntity({
         items: items,
         title: firstItem.get('title'),
         image: firstItem.get('image'),
      });
   };

   protected _dragEnd(_: SyntheticEvent, entity: Collection<Model>, target: unknown, position: string): void {
      this._children.listMover.moveItems(entity.getItems(), target, position);
   };

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
