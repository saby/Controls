import { assert } from 'chai';

import IItemsStrategy from 'Controls/_display/IItemsStrategy';

import {
   Collection as CollectionDisplay, CollectionItem
} from 'Controls/display';
import Drag from 'Controls/_display/itemsStrategy/Drag';
import { Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';

describe('Controls/_display/itemsStrategy/Drag', () => {
   function wrapItem<S extends Model = Model, T = CollectionItem>(item: S): T {
      return new CollectionItem({
         contents: item
      });
   }

   function getSource<S = Model, T = CollectionItem>(wraps: T[]): IItemsStrategy<S, T> {
      const items = wraps.slice();

      return {
         '[Controls/_display/IItemsStrategy]': true,
         source: null,
         options: {
            display: null
         },
         get count(): number {
            return items.length;
         },
         get items(): T[] {
            return items.slice();
         },
         at(index: number): T {
            return items[index];
         },
         getDisplayIndex(index: number): number {
            return index;
         },
         getCollectionIndex(index: number): number {
            return index;
         },
         splice(start: number, deleteCount: number, added?: S[]): T[] {
            return items.splice(start, deleteCount, ...added.map<T>(wrapItem));
         },
         invalidate(): void {
            this.invalidated = true;
         },
         reset(): void {
            items.length = 0;
         }
      };
   }

   const items = [
      { id: 1, name: 'Ivan' },
      { id: 2, name: 'Alexey' },
      { id: 3, name: 'Olga' }
   ];
   const rs = new RecordSet({
      rawData: items,
      keyProperty: 'id'
   });

   let source;
   let strategy;
   let display;

   beforeEach(() => {
      display = new CollectionDisplay({
         collection: rs
      });
      source = getSource(display.getItems());
      strategy = new Drag({
         source,
         display,
         draggableItem: display.getItemBySourceKey(1),
         draggedItemsKeys: [1],
         targetIndex: 0
      });
   });

   afterEach(() => {
      source = undefined;
      strategy = undefined;
   });

   it('.options', () => {
      const options = strategy.options;

      assert.equal(options.source, source);
      assert.equal(options.display, display);
      assert.equal(options.draggableItem, display.getItemBySourceKey(1));
      assert.deepEqual(options.draggedItemsKeys, [1]);
      assert.equal(options.targetIndex, 0);
   });

   it('.source', () => {
      assert.equal(strategy.source, source);
   });

   it('.getCurrentPosition', () => {
      assert.isNotOk(strategy.getCurrentPosition());
   });

   it('.getDisplayIndex', () => {
      assert.equal(strategy.getDisplayIndex(1), 1);
   });

   it('.getCollectionIndex', () => {
      assert.equal(strategy.getCollectionIndex(1), 1);
   });

   it('.count', () => {
      assert.equal(strategy.count, 3);
   });

   it('.at', () => {
      assert.equal(strategy.at(0).getContents(), display.getItemBySourceKey(1).getContents());
   });

   it('items', () => {
      const items = strategy.items;
      assert.equal(items[0].getContents(), display.getItemBySourceKey(1).getContents());
      assert.equal(items[1].getContents(), display.getItemBySourceKey(2).getContents());
      assert.equal(items[2].getContents(), display.getItemBySourceKey(3).getContents());
   });

   it('setPosition', () => {
      // move down
      strategy.setPosition({index: 1, position: 'after', dispItem: display.getItemBySourceKey(2)});
      let items = strategy.items;
      assert.equal(items[0].getContents(), display.getItemBySourceKey(2).getContents());
      assert.equal(items[1].getContents(), display.getItemBySourceKey(1).getContents());
      assert.equal(items[2].getContents(), display.getItemBySourceKey(3).getContents());

      // move up
      strategy.setPosition({index: 0, position: 'before', dispItem: display.getItemBySourceKey(1)});
      items = strategy.items;
      assert.equal(items[0].getContents(), display.getItemBySourceKey(1).getContents());
      assert.equal(items[1].getContents(), display.getItemBySourceKey(2).getContents());
      assert.equal(items[2].getContents(), display.getItemBySourceKey(3).getContents());
   });

   it('.avatarItem', () => {
      assert.isNotOk(strategy.avatarItem);
      strategy.items;
      assert.equal(strategy.avatarItem.getContents(), display.getItemBySourceKey(1).getContents());
   });

   it('drag several items', () => {
      strategy = new Drag({
         source,
         display,
         draggableItem: display.getItemBySourceKey(1),
         draggedItemsKeys: [1, 2],
         targetIndex: 0
      });

      const items = strategy.items;
      assert.equal(items.length, 2);
      assert.equal(items[0].getContents(), display.getItemBySourceKey(1).getContents());
      assert.equal(items[1].getContents(), display.getItemBySourceKey(3).getContents());
   });
});
