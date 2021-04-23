import { assert } from 'chai';

import {
    Tree,
    TreeItem
} from 'Controls/display';

import {
    List,
    ObservableList,
    IObservable as IBindCollectionDisplay,
    RecordSet
} from 'Types/collection';

import { Model } from 'Types/entity';

import {Serializer} from 'UI/State';

interface IData {
    id: number;
    pid?: number;
    node?: boolean;
    title?: string;
}

describe('Controls/_display/Tree', () => {
    function getData(): IData[] {
        /*
            0 - root
                1
                    10
                    11
                    12
                        121
                        122
                        123
                2
                    20
                        200
                            2000
                3
                4
        */

         return [{
             id: 10,
             pid: 1,
             node: true,
             title: 'AA'
         }, {
             id: 11,
             pid: 1,
             node: true,
             title: 'AB'
         }, {
             id: 12,
             pid: 1,
             node: true,
             title: 'AC'
         }, {
             id: 121,
             pid: 12,
             node: true,
             title: 'ACA'
         }, {
             id: 122,
             pid: 12,
             node: false,
             title: 'ACB'
         }, {
             id: 123,
             pid: 12,
             node: false,
             title: 'ACC'
         }, {
             id: 1,
             pid: 0,
             node: true,
             title: 'A'
         }, {
             id: 2,
             pid: 0,
             node: true,
             title: 'B'
         }, {
             id: 20,
             pid: 2,
             node: true,
             title: 'BA'
         }, {
             id: 200,
             pid: 20,
             node: true,
             title: 'BAA'
         }, {
             id: 2000,
             pid: 200,
             title: 'BAAA'
         }, {
             id: 3,
             pid: 0,
             node: false,
             title: 'C'
         }, {
             id: 4,
             pid: 0,
             title: 'D'
         }];
     }

    function getItems(): List<IData> {
        return new List({
            items: getData()
        });
    }

    function getObservableItems(): ObservableList<IData> {
        return new ObservableList({
            items: getData()
        });
    }

    function getTree(items: List<IData>, options: object = {}): Tree<IData> {
        return new Tree({
            ...options,
            collection: items || getItems(),
            root: {
                id: 0,
                title: 'Root'
            },
            keyProperty: 'id',
            parentProperty: 'pid',
            nodeProperty: 'node',
            hasChildrenProperty: 'hasChildren'
        });
    }

    function getObservableTree<T = ObservableList<IData>>(items?: any): Tree<T> {
        return new Tree({
            collection: items || getObservableItems(),
            root: {
                id: 0,
                title: 'Root'
            },
            keyProperty: 'id',
            parentProperty: 'pid',
            nodeProperty: 'node'
        });
    }

    function getRecordSetTree(): Tree<Model> {
        const rs = new RecordSet({
            rawData: getData(),
            keyProperty: 'id'
        });
        return getObservableTree<Model>(rs);
    }

    let items: List<IData>;
    let tree: Tree<IData>;

    beforeEach(() => {
        items = getItems();
        tree = getTree(items);
    });

    afterEach(() => {
        tree.destroy();
        tree = undefined;
        items = undefined;
    });

    describe('.getEnumerator()', () => {
        it('should traverse items in hierarchical order use AdjacencyList strategy', () => {
            const enumerator = tree.getEnumerator();
            const expect = ['A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
            let index = 0;

            while (enumerator.moveNext()) {
                const item = enumerator.getCurrent();
                assert.strictEqual(item.getContents().title, expect[index]);
                index++;
            }
        });

        it('should traverse items in hierarchical order use MaterializedPath strategy', () => {
            const items = [
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
            const tree = new Tree({
                collection: items,
                root: {
                    id: 0,
                    title: 'Root'
                },
                childrenProperty: 'children'
            });
            const enumerator = tree.getEnumerator();
            const expect = [1, 11, 12, 121, 122, 13, 2, 21, 22];
            let index = 0;

            while (enumerator.moveNext()) {
                const item = enumerator.getCurrent();
                assert.strictEqual(item.getContents().id, expect[index]);
                index++;
            }
        });

        it('should traverse all items', () => {
            const enumerator = tree.getEnumerator();
            let index = 0;
            while (enumerator.moveNext()) {
                index++;
            }
            assert.strictEqual(tree.getCount(), index);
            assert.strictEqual(items.getCount(), index);
        });

        it('should traverse all items as flat list if no options specified', () => {
            const tree = new Tree({
                collection: items
            });
            const enumerator = tree.getEnumerator();
            let index = 0;
            while (enumerator.moveNext()) {
                const item = enumerator.getCurrent();
                assert.strictEqual(item.getContents(), items.at(index));
                index++;
            }
            assert.strictEqual(tree.getCount(), index);
            assert.strictEqual(items.getCount(), index);
        });

        it('should traverse root if "rootEnumerable" option is true', () => {
            const tree = new Tree({
                collection: items,
                root: {
                    id: 0,
                    title: 'Root'
                },
                rootEnumerable: true,
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
            const enumerator = tree.getEnumerator();
            const expect = ['Root', 'A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
            let index = 0;
            while (enumerator.moveNext()) {
                const item = enumerator.getCurrent();
                assert.strictEqual(item.getContents().title, expect[index]);
                index++;
            }
            assert.strictEqual(tree.getCount(), index);
            assert.strictEqual(items.getCount(), index - 1);
        });
    });

    describe('.each()', () => {
        it('should update the display after move grouped item out of the root', () => {
            const rs = new RecordSet({
                rawData: [
                    {id: 1, pid: 1, group: 'a'},
                    {id: 2, pid: 1, group: 'a'},
                    {id: 3, pid: 1, group: 'a'}
                ]
            });
            const tree = new Tree({
                collection: rs,
                root: 1,
                keyProperty: 'id',
                parentProperty: 'pid',
                group: (item) => item.get('group')
            });
            const model = rs.at(1);
            const expectedBefore = ['a', rs.at(0), rs.at(1), rs.at(2)];
            const expectedAfter = ['a', rs.at(0), rs.at(2)];

            tree.each((item, i) => {
                assert.equal(expectedBefore[i], item.getContents());
            });

            model.set('pid', 0);
            tree.each((item, i) => {
                assert.equal(expectedAfter[i], item.getContents());
            });
        });
    });

    describe('.getItemBySourceItem()', () => {
        it('should return projection item if it collection item have been changed', () => {
            const tree = getRecordSetTree();
            const collection = tree.getCollection() as any as RecordSet;
            const item = collection.getRecordById(10);

            tree.setFilter((collItem) => (collItem.get('pid') === 0) ? true : false);
            item.set('pid', 0);
            assert.isDefined(tree.getItemBySourceItem(item));
        });
    });

    describe('.getParentProperty()', () => {
        it('should return given value', () => {
            assert.equal(tree.getParentProperty(), 'pid');
        });
    });

    describe('.setParentProperty()', () => {
        it('should change the value', () => {
            tree.setParentProperty('uid');
            assert.equal(tree.getParentProperty(), 'uid');
        });

        it('should bring all items to the root', () => {
            tree.setRoot(null);
            tree.setParentProperty('');
            let count = 0;
            tree.each((item) => {
                assert.equal(item.getContents(), items.at(count));
                count++;

            });
            assert.strictEqual(count, items.getCount());
            assert.strictEqual(tree.getCount(), items.getCount());
        });
    });

    describe('.getNodeProperty(), .setNodeProperty()', () => {
        it('should return given value', () => {
            assert.equal(tree.getNodeProperty(), 'node');
            tree.setNodeProperty('nodeProperty');
            assert.equal(tree.getNodeProperty(), 'nodeProperty');
        });
    });

    describe('.getChildrenProperty(), .setChildrenProperty()', () => {
        it('should return given value', () => {
            assert.strictEqual(tree.getChildrenProperty(), '');
            tree.setChildrenProperty('childrenProperty');
            assert.strictEqual(tree.getChildrenProperty(), 'childrenProperty');
        });
    });

    describe('.getRoot()', () => {
        it('should return given root from a number', () => {
            const tree = new Tree({
                collection: items,
                root: 0,
                keyProperty: 'id'
            });
            assert.strictEqual(tree.getRoot().getContents(), 0 as any);
        });

        it('should return given root from a string', () => {
            const tree = new Tree({
                collection: items,
                root: '',
                keyProperty: 'id'
            });
            assert.strictEqual(tree.getRoot().getContents(), '' as any);
        });

        it('should return given root from an object', () => {
            const tree = new Tree({
                collection: items,
                root: {id: 1, title: 'Root'},
                keyProperty: 'id'
            });
            assert.strictEqual(tree.getRoot().getContents().id, 1);
            assert.strictEqual(tree.getRoot().getContents().title, 'Root');
        });

        it('should return given root from a TreeItem', () => {
            const root = new TreeItem({contents: {
                id: null,
                title: 'Root'
            }});
            const tree = new Tree({
                collection: items,
                root,
                keyProperty: 'id'
            });
            assert.strictEqual(tree.getRoot(), root);
        });

        it('should return a valid enumerable root if it have children without link by contents', () => {
            const tree = new Tree({
                collection: items,
                root: null,
                rootEnumerable: true,
                keyProperty: 'id'
            });
            const root = tree.getRoot();

            assert.isNull(root.getContents());
            assert.isTrue(root.isRoot());
            assert.isUndefined(root.getParent());
        });

        it('should return a root without trigger property change event', () => {
            const tree = new Tree({
                collection: items,
                root: 0,
                keyProperty: 'id'
            });

            let triggered = false;
            const handler = () => {
                triggered = true;
            };

            tree.subscribe('onCollectionChange', handler);
            tree.getRoot();
            tree.unsubscribe('onCollectionChange', handler);

            assert.isFalse(triggered);
        });
    });

    describe('.setRoot()', () => {
        it('should set root as scalar', () => {
            tree.setRoot(1);
            assert.strictEqual(tree.getRoot().getContents() as any, 1);
        });

        it('should set root as object', () => {
            const root = {id: 1};
            tree.setRoot(root);
            assert.strictEqual(tree.getRoot().getContents(), root);
        });

        it('should set root as tree item', () => {
            const root = new TreeItem({contents: {
                    id: null,
                    title: 'Root'
                }});
            tree.setRoot(root);
            assert.strictEqual(tree.getRoot(), root);
        });

        it('should update count', () => {
            assert.notEqual(tree.getCount(), 6);
            tree.setRoot(1);
            assert.strictEqual(tree.getCount(), 6);
        });

        it('should keep old instances', () => {
            const oldItems = [];
            const newItems = [];

            tree.each((item) => {
                oldItems.push(item);
            });

            tree.setRoot(1);
            tree.each((item) => {
                newItems.push(item);
            });

            assert.deepEqual(oldItems.slice(1, 7), newItems);
        });

        it('should change items and then the revert it back', () => {
            const before = [];
            tree.each((item) => {
                before.push(item.getContents());
            });
            assert.notEqual(before.length, 6);

            // Change items
            tree.setRoot(1);
            const after = [];
            tree.each((item) => {
                after.push(item.getContents());
            });
            assert.strictEqual(after.length, 6);

            // Revert back
            tree.setRoot(0);
            const revert = [];
            tree.each((item) => {
                revert.push(item.getContents());
            });
            assert.deepEqual(revert, before);
        });

        it('should set root if grouping has used', () => {
            const items = [
                {id: 1, pid: 0, g: 0},
                {id: 2, pid: 0, g: 1},
                {id: 11, pid: 1, g: 0}
            ];
            const list = new List({
                items
            });
            const tree = new Tree({
                collection: list,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                group: (item) => item.g
            });

            tree.setRoot(1);
            assert.strictEqual(tree.getCount(), 2);
        });
    });

    describe('.isRootEnumerable()', () => {
        it('should return false by default', () => {
            assert.isFalse(tree.isRootEnumerable());
        });
    });

    describe('.setRootEnumerable()', () => {
        it('should change root to enumerable', () => {
            tree.setRootEnumerable(true);
            assert.isTrue(tree.isRootEnumerable());
        });

        it('should not change root to enumerable', () => {
            tree.setRootEnumerable(false);
            assert.isFalse(tree.isRootEnumerable());
        });

        it('should traverse root after change to true', () => {
            tree.setRootEnumerable(true);

            const expect = ['Root', 'A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
            let index = 0;
            tree.each((item) => {
                assert.strictEqual(item.getContents().title, expect[index]);
                index++;
            });
            assert.strictEqual(tree.getCount(), index);
            assert.strictEqual(items.getCount(), index - 1);
        });

        it('should not traverse root after change to false', () => {
            tree.setRootEnumerable(true);
            tree.setRootEnumerable(false);

            const expect = ['A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC', 'B', 'BA', 'BAA', 'BAAA', 'C', 'D'];
            let index = 0;
            tree.each((item) => {
                assert.strictEqual(item.getContents().title, expect[index]);
                index++;
            });
            assert.strictEqual(tree.getCount(), index);
            assert.strictEqual(items.getCount(), index);
        });
    });

    describe('.getRootLevel()', () => {
        it('should return 0 if root is not enumerable', () => {
            const collection = new List();
            const tree = new Tree({
                collection,
                rootEnumerable: false
            });
            assert.strictEqual(tree.getRootLevel(), 0);
        });

        it('should return 1 if root is enumerable', () => {
            const collection = new List();
            const tree = new Tree({
                collection,
                rootEnumerable: true
            });
            assert.strictEqual(tree.getRootLevel(), 1);
        });
    });

    describe('.getChildren()', () => {
        it('should return children of a root', () => {
            const children = tree.getChildren(tree.getRoot());
            const expect = ['A', 'B', 'C', 'D'];

            assert.equal(children.getCount(), expect.length);
            children.each((child, index) => {
                assert.strictEqual(child.getContents().title, expect[index]);
            });
        });

        it('should return children of the first node', () => {
            const children = tree.getChildren(tree.at(0));
            const expect = ['AA', 'AB', 'AC'];

            assert.equal(children.getCount(), expect.length);
            children.each((child, index) => {
                assert.strictEqual(child.getContents().title, expect[index]);
            });
        });

        it('should return children hidden by the filter', () => {
            const expect = ['AA', 'AB', 'AC'];

            tree.setFilter((item) => item.title !== 'AB');

            assert.equal(
                tree.getChildren(tree.at(0), true).getCount(),
                expect.length - 1
            );

            const children = tree.getChildren(tree.at(0), false);

            assert.equal(
                children.getCount(),
                expect.length
            );
            children.each((child, index) => {
                assert.strictEqual(child.getContents().title, expect[index]);
            });
        });

        it('should throw an error for invalid node', () => {
            assert.throws(() => {
                tree.getChildren(undefined);
            });
            assert.throws(() => {
                tree.getChildren({} as any);
            });
        });
    });

    describe('.getItemUid()', () => {
        it('should return path from item to the root', () => {
            const data = [
                {id: 1, pid: 0},
                {id: 2, pid: 1},
                {id: 3, pid: 2}
            ];
            const items = new List({
                items: data
            });
            const tree = getTree(items);
            const expect = ['1', '2:1', '3:2:1'];

            let index = 0;
            tree.each((item) => {
                assert.strictEqual(tree.getItemUid(item), expect[index]);
                index++;
            });
            assert.equal(index, expect.length);
        });

        it('should return path for items with duplicated ids', () => {
            const data = [
                {id: 1, pid: 0},
                {id: 2, pid: 1},
                {id: 3, pid: 2},
                {id: 2, pid: 1}
            ];
            const items = new List({
                items: data
            });
            const tree = getTree(items);
            const expect = ['1', '2:1', '3:2:1', '2:1-1', '3:2:1-1'];

            let index = 0;
            tree.each((item) => {
                assert.strictEqual(tree.getItemUid(item), expect[index]);
                index++;
            });
            assert.equal(index, expect.length);
        });

        it('should mind not only TreeItems in path to root', () => {
            const tree = getTree(new List());
            const parent: any = {
                getContents: () => {
                    return {id: 1};
                }
            };
            const item = new TreeItem({
                contents: {id: 2},
                parent
            });

            assert.strictEqual(tree.getItemUid(item), '2');
        });
    });

    describe('.getIndexBySourceItem()', () => {
        it('should return 0 for root contents if root is enumerable', () => {
            const tree = new Tree({
                collection: items,
                root: items[1],
                rootEnumerable: true,
                keyProperty: 'id'
            });

            assert.strictEqual(tree.getIndexBySourceItem(items[1]), 0);
        });
    });

    describe('.getIndexBySourceIndex()', () => {
        it('should return valid tree index if root is enumerable', () => {
            tree.setRootEnumerable(true);
            for (let i = 0; i < items.getCount(); i++) {
                const index = tree.getIndexBySourceIndex(i);
                assert.strictEqual(
                    items.at(i),
                    tree.at(index).getContents()
                );
            }
        });
    });

    describe('.getSourceIndexByIndex()', () => {
        it('should return valid source collection index if root is enumerable', () => {
            tree.setRootEnumerable(true);
            for (let i = 0; i < tree.getCount(); i++) {
                const index = tree.getSourceIndexByIndex(i);
                if (index === -1) {
                    assert.strictEqual(
                        tree.at(i),
                        tree.getRoot()
                    );
                } else {
                    assert.strictEqual(
                        tree.at(i).getContents(),
                        items.at(index)
                    );
                }
            }
        });
    });

    describe('.getNext()', () => {
        it('should return next item', () => {
            const item = tree.getNext(tree.at(0));
            assert.equal(item.getContents().id, 2);
        });

        it('should skip groups', () => {
            const items = [
                {id: 1, pid: 0, g: 0},
                {id: 2, pid: 0, g: 1},
                {id: 11, pid: 1, g: 0},
                {id: 12, pid: 1, g: 0},
                {id: 22, pid: 2, g: 2}
            ];
            const list = new List({
                items
            });
            const display = new Tree({
                collection: list,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                group: (item) => item.g
            });

            let item = display.at(1); // id = 1
            assert.strictEqual(display.getNext(item).getContents().id, 2);

            item = display.at(2); // id = 11
            assert.strictEqual(display.getNext(item).getContents().id, 12);
        });
    });

    describe('.getPrevious()', () => {
        it('should return previous item', () => {
            const item = tree.getPrevious(tree.at(2));
            assert.equal(item.getContents().id, 10);
        });

        it('should skip groups', () => {
            const items = [
                {id: 1, pid: 0, g: 0},
                {id: 2, pid: 0, g: 1},
                {id: 11, pid: 1, g: 0},
                {id: 12, pid: 1, g: 0},
                {id: 22, pid: 2, g: 2}
            ];
            const list = new List({
                items
            });
            const display = new Tree({
                collection: list,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                group: (item) => item.g
            });

            let item = display.at(5); // id = 2
            assert.strictEqual(display.getPrevious(item).getContents().id, 1);

            item = display.at(1); // id = 1
            assert.isUndefined(display.getPrevious(item));
        });
    });

    describe('.setSort', () => {
        it('should sort put folders before leafs', () => {
            const items = [
                {id: 1, pid: 0, node: false},
                {id: 2, pid: 0, node: false},
                {id: 3, pid: 0, node: true},
                {id: 4, pid: 0, node: true}
            ];
            const collection = new List({
                items
            });
            const display = new Tree({
                collection,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
            const exected = [
                items[2],
                items[3],
                items[0],
                items[1]
            ];
            const given = [];

            display.setSort((a, b) => {
                const isNodeA = a.item.isNode();
                const isNodeB = b.item.isNode();
                if (isNodeA === isNodeB) {
                    return 0;
                } else {
                    return isNodeA ? -1 : 1;
                }
            });

            display.each((item) => {
                given.push(item.getContents());
            });

            assert.deepEqual(given, exected);
        });
    });

    describe('.setGroup()', () => {
        it('should place nodes before leafs', () => {
            const items = [
                {id: 1, node: false, group: 'a'},
                {id: 2, node: false, group: 'b'},
                {id: 3, node: true, group: 'a'},
                {id: 4, node: true, group: 'b'},
                {id: 5, node: false, group: 'a'}
            ];
            const list = new List({
                items
            });
            const display = new Tree({
                collection: list,
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
            const expected = [
                'a',
                items[0],
                items[2],
                items[4],
                'b',
                items[1],
                items[3]
            ];
            const given = [];

            display.setGroup((item) => item.group);
            display.each((item) => {
                given.push(item.getContents());
            });

            assert.deepEqual(given, expected);
        });

        it('should place groups inside nodes', () => {
            const items = [
                {id: 1, pid: 0, node: true, group: 'a'},
                {id: 2, pid: 0, node: true, group: 'a'},
                {id: 3, pid: 0, node: false, group: 'a'},
                {id: 11, pid: 1, node: false, group: 'b'},
                {id: 12, pid: 1, node: false, group: 'b'},
                {id: 13, pid: 1, node: false, group: 'c'}
            ];
            const list = new List({
                items
            });
            const display = new Tree({
                collection: list,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
            const expectedA = [
                items[0],
                items[3],
                items[4],
                items[5],
                items[1],
                items[2]
            ];
            const givenA = [];

            display.each((item) => {
                givenA.push(item.getContents());
            });
            assert.deepEqual(givenA, expectedA);

            display.setGroup((item) => item.group);
            const expectedB = [
                'a',
                items[0],
                'b',
                items[3],
                items[4],
                'c',
                items[5],
                'a',
                items[1],
                items[2]
            ];
            const givenB = [];
            display.each((item) => {
                givenB.push(item.getContents());
            });
            assert.deepEqual(givenB, expectedB);
        });

        it('should leave groups inside nodes after add items', () => {
            const items = [
                {id: 1, pid: 0, node: true, group: 'a'},
                {id: 2, pid: 0, node: false, group: 'b'}
            ];
            const addItems = [
                {id: 11, pid: 1, node: false, group: 'c'}
            ];
            const list = new ObservableList({
                items
            });
            const display = new Tree({
                collection: list,
                root: 0,
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node',
                group: (item) => item.group
            });
            const expected = [
                'a',
                items[0],
                'c',
                addItems[0],
                'b',
                items[1]
            ];
            const given = [];

            list.append(addItems);
            display.each((item) => {
                given.push(item.getContents());
            });
            assert.deepEqual(given, expected);
        });
    });

    describe('.setEventRaising()', () => {
        it('should save expanded when unfreeze collection', () => {
            const tree = getObservableTree();
            const item = tree.getNext(tree.at(0));

            item.setExpanded(true);
            (tree.getCollection() as any).setEventRaising(false);
            (tree.getCollection() as any).setEventRaising(true);
            assert.isTrue(item.isExpanded());
        });
    });

    describe('.subscribe()', () => {
        const getCollectionChangeHandler = (given, itemsMapper?) => {
            return (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems: itemsMapper ? newItems.map(itemsMapper) : newItems,
                    newItemsIndex,
                    oldItems: itemsMapper ? oldItems.map(itemsMapper) : oldItems,
                    oldItemsIndex
                });
            };
        };

        context('onCollectionChange', () => {
            it('should fire with all of children if add a node', () => {
                const tree = getObservableTree();
                const list = tree.getCollection() as ObservableList<IData>;
                const newItems = [
                    {id: 51,  pid: 5,  title: 'EA'},
                    {id: 52,  pid: 5,  title: 'EB'},
                    {id: 521, pid: 52, title: 'EBA'},
                    {id: 53,  pid: 5,  title: 'EC'}
                ];
                const newNode = {id: 5, pid: 0, title: 'E'};
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: ['E', 'EA', 'EB', 'EBA', 'EC'],
                    newItemsIndex: list.getCount(),
                    oldItems: [],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().title);

                tree.subscribe('onCollectionChange', handler);
                list.append(newItems);
                list.add(newNode);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with all of children after remove a node', () => {
                const tree = getObservableTree();
                const firstNodeItemIndex = 6;
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: ['A', 'AA', 'AB', 'AC', 'ACA', 'ACB', 'ACC'],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().title);

                tree.subscribe('onCollectionChange', handler);
                (tree.getCollection() as ObservableList<IData>).removeAt(firstNodeItemIndex);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with only removed node if filter used', () => {
                const data = [
                    {id: 1, pid: 0},
                    {id: 11, pid: 1},
                    {id: 2, pid: 0},
                    {id: 3, pid: 0}
                ];
                const list = new ObservableList({
                    items: data
                });
                const tree = new Tree({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    filter: (item) => item.pid === 0
                });
                const given = [];
                const handler = getCollectionChangeHandler(given);

                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: [tree.at(0)],
                    oldItemsIndex: 0
                }];

                tree.subscribe('onCollectionChange', handler);
                list.removeAt(0);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire on move a node down', () => {
                const items = [
                    {id: 1, pid: 0},
                    {id: 2, pid: 0},
                    {id: 3, pid: 0}
                ];
                const list = new ObservableList({
                    items
                });
                const tree = new Tree({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                const moveFrom = 1;
                const moveTo = 2;
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_MOVE,
                    newItems: [items[moveTo]],
                    newItemsIndex: moveFrom,
                    oldItems: [items[moveTo]],
                    oldItemsIndex: moveTo
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents());

                tree.subscribe('onCollectionChange', handler);
                list.move(moveFrom, moveTo);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire on move a node up', () => {
                const items = [
                    {id: 1, pid: 0},
                    {id: 2, pid: 0},
                    {id: 3, pid: 0}
                ];
                const list = new ObservableList({
                    items
                });
                const tree = new Tree({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                const moveFrom = 2;
                const moveTo = 0;
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_MOVE,
                    newItems: [items[moveFrom]],
                    newItemsIndex: moveTo,
                    oldItems: [items[moveFrom]],
                    oldItemsIndex: moveFrom
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents());

                tree.subscribe('onCollectionChange', handler);
                list.move(moveFrom, moveTo);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('shouldn\'t fire on move a node in sorted tree', () => {
                const sort = (a, b) => {
                    const isNodeA = a.item.isNode();
                    const isNodeB = b.item.isNode();
                    if (isNodeA === isNodeB) {
                        return a.index > b.index ? 1 : -1;
                    } else {
                        return isNodeA ? -1 : 1;
                    }
                };
                const list = new ObservableList({
                    items: [
                        {id: 1, pid: 0, node: true},
                        {id: 2, pid: 0, node: true},
                        {id: 3, pid: 0, node: false},
                        {id: 4, pid: 1, node: false},
                        {id: 5, pid: 1, node: false},
                        {id: 6, pid: 0, node: true}
                    ]
                });
                const tree = new Tree({
                    collection: list,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    nodeProperty: 'node',
                    sort
                });
                const moveFrom = 5;
                const moveTo = 2;
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents());

                tree.subscribe('onCollectionChange', handler);
                list.move(moveFrom, moveTo);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, []);
            });

            it('should fire properly with duplicates', () => {
                const list = new ObservableList({
                    items: [
                        {id: 'a',   pid: 0},
                        {id: 'aa',  pid: 'a'},
                        {id: 'aaa', pid: 'aa'},
                        {id: 'b',   pid: 0},
                        {id: 'ba',  pid: 'b'},
                        {id: 'bb',  pid: 'b'}
                    ]
                });
                const tree = getObservableTree(list);

                /*
                   0  +-a
                   1  | +-aa
                   2  |   +-aaa
                   3  +-b
                   4    +-ba
                   5      +-bb
                   =>
                   0  +-a
                   1  | +-aa
                   2  |   +-aaa
                   3  |     +-aa1  1st event
                   4  +-b
                   5  | +-ba
                   6  |   +-bb
                   7  +-a          2nd event
                   8    +-aa       2nd event
                   9      +-aaa    2nd event
                   10       +-aa1  2nd event
                */
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: ['aa1'],
                    newItemsIndex: 3,
                    oldItems: [],
                    oldItemsIndex: 0
                }, {
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: ['a', 'aa', 'aaa', 'aa1'],
                    newItemsIndex: 7,
                    oldItems: [],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().id);

                tree.subscribe('onCollectionChange', handler);
                list.append([
                    {id: 'a',   pid: 0},
                    {id: 'aa1', pid: 'a'}
                ]);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire after call setRootEnumerable with change to true', () => {
                const given = [];
                const handler = getCollectionChangeHandler(given);

                tree.subscribe('onCollectionChange', handler);
                tree.setRootEnumerable(true);
                tree.unsubscribe('onCollectionChange', handler);

                const expected = [{
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: [tree.at(0)],
                    newItemsIndex: 0,
                    oldItems: [],
                    oldItemsIndex: 0
                }];

                assert.deepEqual(given, expected);
            });

            it('should fire after call setRootEnumerable with change to false', () => {
                const given = [];
                const handler = getCollectionChangeHandler(given);

                tree.setRootEnumerable(true);
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: [tree.at(0)],
                    oldItemsIndex: 0
                }];

                tree.subscribe('onCollectionChange', handler);
                tree.setRootEnumerable(false);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with valid newItemsIndex if root is enumerable', () => {
                const tree = getObservableTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const newItem = {id: 999, pid: 0, title: 'New'};
                const index = 1;

                // Add newItem into root will affect: add newItem, change root
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: [999],
                    newItemsIndex: 1,
                    oldItems: [],
                    oldItemsIndex: 0
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: [0],
                    newItemsIndex: 0,
                    oldItems: [0],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().id);

                tree.at(0);
                tree.setRootEnumerable(true);
                tree.subscribe('onCollectionChange', handler);
                collection.add(newItem, index);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with valid oldItemsIndex if root is enumerable', () => {
                const tree = getObservableTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const index = 1;
                const item = collection.at(index);

                // Remove AB from A will affect: remove AB, change A
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: [item.title],
                    oldItemsIndex: 3
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['A'],
                    newItemsIndex: 1,
                    oldItems: ['A'],
                    oldItemsIndex: 1
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().title);

                tree.setRootEnumerable(true);
                tree.subscribe('onCollectionChange', handler);
                collection.removeAt(index);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with updated hierarchy level', () => {
                const tree = getRecordSetTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const index = collection.getIndexByValue('id', 4);
                const item = collection.at(index);
                const treeItem = tree.getItemBySourceItem(item);
                const oldLevel = treeItem.getLevel();

                let level;
                tree.subscribe('onCollectionChange', (e, action, newItems) => {
                    if (newItems[0].getContents() === item) {
                        level = newItems[0].getLevel();
                    }
                });
                item.set('pid', 1);
                assert.strictEqual(oldLevel + 1, level);
            });

            it('should fire with updated hierarchy level if grouped', () => {
                const tree = getRecordSetTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const index = collection.getIndexByValue('id', 4);
                const item = collection.at(index);
                const treeItem = tree.getItemBySourceItem(item);
                const oldLevel = treeItem.getLevel();

                tree.setGroup(() => {
                    return 'foo';
                });

                let level;
                tree.subscribe('onCollectionChange', (e, action, newItems) => {
                    if (newItems[0].getContents() === item) {
                        level = newItems[0].getLevel();
                    }
                });

                item.set('pid', 1);
                assert.strictEqual(oldLevel + 1, level);
            });

            it('should fire with an item that changed the level with the parent', () => {
                const rawData = [
                    {id: 1, pid: 0},
                    {id: 11, pid: 1},
                    {id: 111, pid: 11},
                    {id: 1111, pid: 111}
                ];
                const items = new RecordSet({
                    rawData
                });
                const tree = new Tree({
                    collection: items,
                    root: 0,
                    keyProperty: 'id',
                    parentProperty: 'pid'
                });
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: [1, 11, 111, 1111],
                    newItemsIndex: 0,
                    oldItems: [1, 11, 111, 1111],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().get('id'));
                const record = items.at(2);

                tree.subscribe('onCollectionChange', handler);
                record.set('pid', 1);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire on changed node if item has been moved to one', () => {
                const tree = getRecordSetTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const positionD = collection.getIndexByValue('title', 'D');
                const itemD = collection.at(positionD);

                // Move D into AC will affect: move D, change AC
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_MOVE,
                    newItems: [itemD.get('title')],
                    newItemsIndex: 7,
                    oldItems: [itemD.get('title')],
                    oldItemsIndex: 12
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['AC'],
                    newItemsIndex: 3,
                    oldItems: ['AC'],
                    oldItemsIndex: 3
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().get('title'));

                tree.subscribe('onCollectionChange', handler);
                itemD.set('pid', 12); // Root -> AC
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire on changed node if it\'s item has been moved to another node', () => {
                const tree = getRecordSetTree();
                const collection = tree.getCollection() as any as RecordSet;
                const item = collection.getRecordById(200);

                // Move BAA into AC will affect: move BAA, move BAAA, change BAA, change AC, change BA
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_MOVE,
                    newItems: ['BAA', 'BAAA'],
                    newItemsIndex: 7,
                    oldItems: ['BAA', 'BAAA'],
                    oldItemsIndex: 9
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['AC'],
                    newItemsIndex: 3,
                    oldItems: ['AC'],
                    oldItemsIndex: 3
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['BA'],
                    newItemsIndex: 10,
                    oldItems: ['BA'],
                    oldItemsIndex: 10
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().get('title'));

                tree.subscribe('onCollectionChange', handler);
                item.set('pid', 12);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire on parent node if item has been added to it but filtered', () => {
                const tree = getRecordSetTree();
                const collection = tree.getCollection() as any as RecordSet;
                const itemId = 2000;
                const parentId = 1;
                const item = collection.getRecordById(itemId);

                // Add BAAA (2000) into A (1) as hidden will affect: change A
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['A'],
                    newItemsIndex: 0,
                    oldItems: ['A'],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().get('title'));

                collection.remove(item);
                tree.setFilter((item) => item.get('pid') !== parentId);
                tree.subscribe('onCollectionChange', handler);
                item.set('pid', parentId);
                collection.add(item);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire with inherited "expanded" property after replace an item', () => {
                const tree = getObservableTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const itemIndex = 1;
                const item = tree.at(itemIndex);
                const sourceIndex = collection.getIndex(item.getContents());
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: [true],
                    oldItemsIndex: 1
                }, {
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: [true],
                    newItemsIndex: 1,
                    oldItems: [],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.isExpanded());

                const newItem = Object.create(item.getContents());
                item.setExpanded(true);

                tree.subscribe('onCollectionChange', handler);
                collection.replace(newItem, sourceIndex);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should dont with inherited "expanded" property after replace an item which no longer presented ' +
                'in the tree', () => {
                const tree = getObservableTree();
                const collection = tree.getCollection() as ObservableList<IData>;
                const itemIndex = 1;
                const item = tree.at(itemIndex);
                const sourceIndex = collection.getIndex(item.getContents());
                const expected = [{
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: [true],
                    oldItemsIndex: 1
                }, {
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: [false],
                    newItemsIndex: 0,
                    oldItems: [false],
                    oldItemsIndex: 0
                }];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.isExpanded());

                const newItem = Object.create(item.getContents());
                newItem.pid = -1;
                item.setExpanded(true);

                tree.subscribe('onCollectionChange', handler);
                collection.replace(newItem, sourceIndex);
                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });

            it('should fire after remove-collapse-add-expand a node if filter used', () => {
                const items = [
                    {id: 'a', pid: null},
                    {id: 'b', pid: null},
                    {id: 'c', pid: 'a'}
                ];
                const list = new ObservableList({
                    items
                });
                let hidden = [];
                const tree = new Tree({
                    keyProperty: 'id',
                    parentProperty: 'pid',
                    root: null,
                    collection: list,
                    filter: (item) => hidden.indexOf(item.id) === -1
                });
                const expected = [];
                const given = [];
                const handler = getCollectionChangeHandler(given, (item) => item.getContents().id);

                const nodeA = tree.at(0);
                nodeA.setExpanded(true);

                tree.subscribe('onCollectionChange', handler);

                const removedItem = nodeA.getContents();
                list.remove(removedItem);
                expected.push({
                    action: IBindCollectionDisplay.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: ['a', 'c'],
                    oldItemsIndex: 0
                });

                hidden = ['c'];
                nodeA.setExpanded(false);
                expected.push({
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['a'],
                    newItemsIndex: -1,
                    oldItems: ['a'],
                    oldItemsIndex: -1
                });

                list.add(removedItem);
                const nodeB = tree.at(1);
                expected.push({
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: ['a'],
                    newItemsIndex: 1,
                    oldItems: [],
                    oldItemsIndex: 0
                });

                hidden = [];
                nodeB.setExpanded(true);
                expected.push({
                    action: IBindCollectionDisplay.ACTION_ADD,
                    newItems: ['c'],
                    newItemsIndex: 2,
                    oldItems: [],
                    oldItemsIndex: 0
                });
                expected.push({
                    action: IBindCollectionDisplay.ACTION_CHANGE,
                    newItems: ['a'],
                    newItemsIndex: 1,
                    oldItems: ['a'],
                    oldItemsIndex: 1
                });

                tree.unsubscribe('onCollectionChange', handler);

                assert.deepEqual(given, expected);
            });
        });
    });

    describe('.toJSON()', () => {
        it('should clone the tree', () => {
            const serializer = new Serializer();
            const json = JSON.stringify(tree, serializer.serialize);
            const clone = JSON.parse(json, serializer.deserialize);
            const items = tree.getItems();
            const cloneItems = clone.getItems();

            for (let i = 0; i < items.length; i++) {
                assert.strictEqual(
                    items[i].getInstanceId(),
                    cloneItems[i].getInstanceId(),
                    'at ' + i
                );

                const parent = items[i].getParent();
                const cloneParent = cloneItems[i].getParent();
                assert.strictEqual(
                    parent.getInstanceId(),
                    cloneParent.getInstanceId(),
                    'at parent for ' + i
                );
            }
        });

        it('should keep relation between a tree item contents and the source collection', () => {
            const serializer = new Serializer();
            const json = JSON.stringify(tree, serializer.serialize);
            const clone = JSON.parse(json, serializer.deserialize);

            clone.each((item) => {
                assert.notEqual(clone.getCollection().getIndex(item.getContents()), -1);
            });

        });
    });

    describe('expandable/collapsed', () => {
        let rsTree;

        beforeEach(() => {
            rsTree = getRecordSetTree();
        });

        it('setExpandedItems', () => {
            assert.isFalse(rsTree.getItemBySourceKey(1).isExpanded());
            const expandedItems = [1];
            rsTree.setExpandedItems(expandedItems);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());
            assert.notEqual(rsTree.getExpandedItems(), expandedItems);
        });

        it('setExpandedItems with same expanded items', () => {
            rsTree.setExpandedItems([1]);
            const currentVersion = rsTree.getVersion();
            rsTree.setExpandedItems([1]);
            assert.equal(currentVersion, rsTree.getVersion());
        });

        it('setExpandedItems with removed null', () => {
            rsTree.setExpandedItems([null]);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());

            rsTree.setExpandedItems([]);
            assert.isFalse(rsTree.getItemBySourceKey(1).isExpanded());
        });

        it('setExpandedItems collapse childs', () => {
            rsTree.setExpandedItems([1]);
            rsTree.getItemBySourceKey(11).setExpanded(true);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());
            assert.isTrue(rsTree.getItemBySourceKey(11).isExpanded());
            rsTree.setExpandedItems([]);
            assert.isFalse(rsTree.getItemBySourceKey(1).isExpanded());
            assert.isFalse(rsTree.getItemBySourceKey(11).isExpanded());
            rsTree.setExpandedItems([1]);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());
            assert.isFalse(rsTree.getItemBySourceKey(11).isExpanded());
        });

        it('setCollapsedItems', () => {
            rsTree.setExpandedItems([1]);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());
            const collapsedItems = [1];
            rsTree.setCollapsedItems(collapsedItems);
            assert.isFalse(rsTree.getItemBySourceKey(1).isExpanded());
            assert.notEqual(rsTree.getCollapsedItems(), collapsedItems);

            const currentVersion = rsTree.getVersion();
            rsTree.setCollapsedItems(collapsedItems);
            assert.equal(currentVersion, rsTree.getVersion());
        });

        it('setCollapsedItems with same expanded items', () => {
            rsTree.setCollapsedItems([1]);
            const currentVersion = rsTree.getVersion();
            rsTree.setCollapsedItems([1]);
            assert.equal(currentVersion, rsTree.getVersion());
        });

        it('toggleItem will not change version for another items', () => {
            const currentVersions = rsTree.getItems().map((it) => {
                return {
                    key: it.getContents().getKey(),
                    version: it.getVersion()
                };
            });
            rsTree.toggleExpanded(rsTree.getItemBySourceKey(1));
            currentVersions.forEach((it) => {
                if (it.key !== 1) {
                    assert.equal(it.version, rsTree.getItemBySourceKey(it.key).getVersion());
                }
            });
        });

        it('setCollapsedItems collapse childs', () => {
            rsTree.setExpandedItems([null]);
            assert.isTrue(rsTree.getItemBySourceKey(1).isExpanded());
            assert.isTrue(rsTree.getItemBySourceKey(11).isExpanded());
            rsTree.setCollapsedItems([1]);
            assert.isFalse(rsTree.getItemBySourceKey(1).isExpanded());
            assert.isFalse(rsTree.getItemBySourceKey(11).isExpanded());
        });

        describe('create item with right expanded state', () => {
            it('all expandable', () => {
                rsTree.setExpandedItems([null]);
                const contents = new Model({
                    rawData: {
                        id: 123456
                    },
                    keyProperty: 'id'
                });
                const newItem = rsTree.createItem({contents});
                assert.isTrue(newItem.isExpanded());
            });

            it('all expandable, but one is collapsed', () => {
                rsTree.setExpandedItems([null]);
                rsTree.setCollapsedItems([123456]);
                const contents = new Model({
                    rawData: {
                        id: 123456
                    },
                    keyProperty: 'id'
                });
                const newItem = rsTree.createItem({contents});
                assert.isFalse(newItem.isExpanded());
            });

            it('one expanded', () => {
                rsTree.setExpandedItems([123456]);
                const contents = new Model({
                    rawData: {
                        id: 123456
                    },
                    keyProperty: 'id'
                });
                const newItem = rsTree.createItem({contents});
                assert.isTrue(newItem.isExpanded());
            });
        });
    });

    describe('hasNodeWithChildren', () => {
       describe('hidden nodes', () => {
           it('has node with children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {expanderVisibility: 'hasChildren'});
               assert.isTrue(tree.hasNodeWithChildren());
           });

           it('not has node with children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: false, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {expanderVisibility: 'hasChildren'});
               assert.isFalse(tree.hasNodeWithChildren());
           });
        });
       describe('default nodes', () => {
           it('has node with children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: true, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {expanderVisibility: 'hasChildren'});
               assert.isTrue(tree.hasNodeWithChildren());
           });

           it('not has node with children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: false, node: true, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {expanderVisibility: 'hasChildren'});
               assert.isFalse(tree.hasNodeWithChildren());
           });
        });
    });

    describe('hasChildren', () => {
       describe('by option', () => {
           it('has children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs);
               assert.isTrue(tree.at(0).isHasChildren());
               assert.isFalse(tree.at(0).isHasChildrenByRecordSet());
           });

           it('not has children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: false, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs);
               assert.isFalse(tree.at(0).isHasChildren());
               assert.isFalse(tree.at(0).isHasChildrenByRecordSet());
           });
        });

       describe('by recordset', () => {
           it('has children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: false, pid: 0},
                       {id: 2, hasChildren: true, node: false, pid: 1}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {hasChildrenProperty: ''});
               assert.isTrue(tree.at(0).isHasChildren());
               assert.isTrue(tree.at(0).isHasChildrenByRecordSet());
           });

           it('not has children', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: false, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs, {hasChildrenProperty: ''});
               assert.isFalse(tree.at(0).isHasChildren());
               assert.isFalse(tree.at(0).isHasChildrenByRecordSet());
           });
        });

       describe('hasChildrenProperty is priority', () => {
           it('has children by recordset, but not has by property', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: false, node: false, pid: 0},
                       {id: 2, hasChildren: false, node: false, pid: 1}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs);
               assert.isFalse(tree.at(0).isHasChildren());
               assert.isTrue(tree.at(0).isHasChildrenByRecordSet());
           });

           it('not has children by recordset, but has by property', () => {
               const rs = new RecordSet({
                   rawData: [
                       {id: 1, hasChildren: true, node: false, pid: 0}
                   ],
                   keyProperty: 'id'
               });
               const tree = getTree(rs);
               assert.isTrue(tree.at(0).isHasChildren());
               assert.isFalse(tree.at(0).isHasChildrenByRecordSet());
           });
       });
    });
});
