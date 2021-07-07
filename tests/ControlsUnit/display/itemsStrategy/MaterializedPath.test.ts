import { assert } from 'chai';

import MaterializedPath, {IOptions} from 'Controls/_display/itemsStrategy/MaterializedPath';

import {
    Tree as TreeDisplay,
    TreeItem
} from 'Controls/display';

describe('Controls/_display/itemsStrategy/MaterializedPath', () => {
    interface IItem {
        id: number;
        children?: IItem[];
    }

    function getOptions<S, T extends TreeItem<S>>(display: TreeDisplay<S, T>): IOptions<S, T> {
        return {
            display,
            childrenProperty: display.getChildrenProperty(),
            root: display.getRoot.bind(display)
        };
    }

    let items: IItem[];
    let expandedItems: number[];
    let display: TreeDisplay<IItem>;
    let strategy: MaterializedPath<IItem>;

    beforeEach(() => {
        items = [
            {id: 1, children: [
                {id: 11, children: []},
                {id: 12, children: [
                    {id: 121, children: []},
                    {id: 122}
                ]},
                {id: 13, children: []}
            ]},
            {id: 2, children: [
                {id: 21},
                {id: 22}
            ]}
        ];
        expandedItems = [1, 11, 12, 121, 122, 13, 2, 21, 22];
        display = new TreeDisplay({
            collection: items,
            childrenProperty: 'children'
        });
        strategy = new MaterializedPath(getOptions(display));
    });

    afterEach(() => {
        items = undefined;
        expandedItems = undefined;
        display = undefined;
        strategy = undefined;
    });

    describe('.at()', () => {
        it('should return a CollectionItems', () => {
            expandedItems.forEach((id, index) => {
                assert.instanceOf(strategy.at(index), TreeItem);
                assert.strictEqual(strategy.at(index).getContents().id, id);
            });
        });

        it('should return a CollectionItems in reverse order', () => {
            for (let index = expandedItems.length - 1; index >= 0; index--) {
                assert.strictEqual(strategy.at(index).getContents().id, expandedItems[index]);
            }
        });

        it('should return the same CollectionItem twice', () => {
            expandedItems.forEach((id, index) => {
                assert.strictEqual(strategy.at(index), strategy.at(index));
            });
        });

        it('should return a CollectionItems with parent', () => {
            const display = new TreeDisplay({
                collection: items,
                childrenProperty: 'children',
                root: {id: 0}
            });
            const strategy = new MaterializedPath(getOptions(display));

            expandedItems.forEach((i, index) => {
                const item = strategy.at(index);
                const id = item.getContents().id;
                const parentId = Math.floor(id / 10);

                assert.strictEqual(item.getParent().getContents().id, parentId);
            });
        });
        it('should return a TreeItem as node', () => {
            const display = new TreeDisplay({
                collection: [{node: true}],
                nodeProperty: 'node'
            });
            const strategy = new MaterializedPath(getOptions(display));

            assert.isTrue(strategy.at(0).isNode());
        });

        it('should return a TreeItem as leaf', () => {
            const display = new TreeDisplay({
                collection: [{node: false}],
                nodeProperty: 'node'
            });
            const strategy = new MaterializedPath(getOptions(display));

            assert.isFalse(strategy.at(0).isNode());
        });

        it('should return a TreeItem with children', () => {
            const display = new TreeDisplay({
                collection: [{hasChildren: true}],
                hasChildrenProperty: 'hasChildren'
            });
            const strategy = new MaterializedPath(getOptions(display));

            assert.isTrue(strategy.at(0).isHasChildren());
        });

        it('should return a TreeItem without children', () => {
            const display = new TreeDisplay({
                collection: [{hasChildren: false}],
                hasChildrenProperty: 'hasChildren'
            });
            const strategy = new MaterializedPath(getOptions(display));

            assert.isFalse(strategy.at(0).isHasChildren());
        });
    });

    describe('.count', () => {
        it('should return items count', () => {
            assert.strictEqual(strategy.count, expandedItems.length);
        });
    });

    describe('.items', () => {
        it('should return an items', () => {
            assert.strictEqual(strategy.items.length, expandedItems.length);
            expandedItems.forEach((id, index) => {
                assert.strictEqual(strategy.items[index].getContents().id, expandedItems[index]);
            });
        });
    });

    describe('.splice()', () => {
        it('should add items', () => {
            const item = {id: 10, children: [
                {id: 100},
                {id: 101}
            ]};
            items[0].children.unshift(item);
            expandedItems.splice(1, 0, 10, 100, 101);
            strategy.splice(0, 0, [item]);

            assert.strictEqual(strategy.items.length, expandedItems.length);
            expandedItems.forEach((id, index) => {
                assert.strictEqual(strategy.at(index).getContents().id, id);
            });
        });

        it('should remove items', () => {
            items.splice(0, 1);
            expandedItems.splice(0, 6);
            strategy.splice(0, 1);

            assert.strictEqual(strategy.items.length, expandedItems.length);
            expandedItems.forEach((id, index) => {
                assert.strictEqual(strategy.at(index).getContents().id, id);
            });
        });
    });

    describe('.reset()', () => {
        it('should re-create items', () => {
            const prevItems = [];
            expandedItems.forEach((id, index) => {
                prevItems.push(strategy.at(index));
            });

            strategy.reset();
            expandedItems.forEach((id, index) => {
                assert.notEqual(strategy.at(index), prevItems[index]);
            });
        });
    });

    describe('.getSorters()', () => {
        it('should append a "tree" sorter', () => {
            const sorters = strategy.getSorters();
            assert.strictEqual(sorters[sorters.length - 1].name, 'tree');
        });

        it('should set the sorter options', () => {
            const sorters = strategy.getSorters();
            assert.isFunction(sorters[0].options);
            assert.isArray(sorters[0].options().indexToPath);
        });
    });

    describe('.sortItems()', () => {
        it('should expand all of the direct branches to the array', () => {
            // [0, 1, 2, 3, 4, 5, 6, 7, 8]
            const current = expandedItems.map((it, i) => i);
            const sorter = strategy.getSorters().pop();
            const options = {
                indexToPath: sorter.options().indexToPath
            };
            const expect = [1, 11, 12, 121, 122, 13, 2, 21, 22];

            const items = strategy.items;
            const sorted = MaterializedPath.sortItems(items, current, options);
            const result = sorted.map((index) => {
                return items[index].getContents().id;
            });

            assert.deepEqual(result, expect);
        });

        it('should expand all of the reversed branches to the array', () => {
            // [8, 7, 6, 5, 4, 3, 2, 1, 0]
            const current = expandedItems.map((it, i) => i).reverse();
            const sorter = strategy.getSorters().pop();
            const options = {
                indexToPath: sorter.options().indexToPath
            };
            // [1, 11, 12, 121, 122, 13, 2, 21, 22] => [2, 22, 21, 1, 13, 12, 122, 121, 11]
            const expect = [2, 22, 21, 1, 13, 12, 122, 121, 11];

            const items = strategy.items;
            const sorted = MaterializedPath.sortItems(items, current, options);
            const result = sorted.map((index) => items[index].getContents().id);

            assert.deepEqual(result, expect);
        });
    });
});
