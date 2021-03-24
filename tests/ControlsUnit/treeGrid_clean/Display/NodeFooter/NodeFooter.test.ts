import { assert } from 'chai';

import IItemsStrategy from 'Controls/_display/IItemsStrategy';

import { Model } from 'Types/entity';
import {TreeItem } from 'Controls/display';
import NodeFooter from 'Controls/_display/itemsStrategy/NodeFooter';
import {RecordSet} from "Types/collection";
import {TreeGridCollection} from "Controls/treeGridNew";

describe('Controls/_display/itemsStrategy/NodeFooter', () => {
    function wrapItem<S extends Model = Model, T = TreeItem>(item: S): T {
        return new TreeItem({
            contents: item
        });
    }

    function getSource<S = Model, T = TreeItem>(wraps: T[]): IItemsStrategy<S, T> {
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
            reset(): void {}
        };
    }

    const recordSet = new RecordSet({
        rawData: [
            { key: 1, parent: null, type: true },
            { key: 2, parent: 1, type: true },
            { key: 3, parent: 2, type: null }
        ],
        keyProperty: 'key'
    });

    let source;
    let strategy;
    let tree;

    beforeEach(() => {
        tree = new TreeGridCollection({
            collection: recordSet,
            keyProperty: 'key',
            parentProperty: 'parent',
            nodeProperty: 'type',
            root: null,
            columns: [{}],
            expandedItems: [null]
        });
        source = getSource(tree.getItems());
        strategy = new NodeFooter({
            display: tree,
            source,
            footerVisibilityCallback: () => true
        });
    });

    afterEach(() => {
        source = undefined;
        strategy = undefined;
    });

    it('items', () => {
        const items = strategy.items;
        assert.equal(items[4].getContents(), 'node-footer-2');
        assert.equal(items[5].getContents(), 'node-footer-1');
    });
});
