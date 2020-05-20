import { assert } from 'chai';

import {
    Abstract as Display,
    Collection as CollectionDisplay,
    CollectionItem,
    GroupItem
} from 'Controls/display';

import {
    IObservable as IBindCollection,
    RecordSet,
    ObservableList,
    List
} from 'Types/collection';

import {
    Model,
    functor,
    Record
} from 'Types/entity'

const ComputeFunctor = functor.Compute;

import * as Serializer from 'Core/Serializer';
import * as coreInstance from 'Core/core-instance';

describe('Controls/_display/Collection', () => {
    interface IItem {
        id: number;
        name?: string;
    }

    interface IGroupItem {
        id: number;
        group: number;
    }

    function getItems(): IItem[] {
        return [{
            id: 1,
            name: 'Иванов'
        }, {
            id: 2,
            name: 'Петров'
        }, {
            id: 3,
            name: 'Сидоров'
        }, {
            id: 4,
            name: 'Пухов'
        }, {
            id: 5,
            name: 'Молодцов'
        }, {
            id: 6,
            name: 'Годолцов'
        }, {
            id: 7,
            name: 'Арбузнов'
        }];
    }

    let items: IItem[];
    let list: ObservableList<IItem>;
    let display: CollectionDisplay<IItem>;

    beforeEach(() => {
        items = getItems();

        list = new ObservableList({
            items
        });

        display = new CollectionDisplay({
            collection: list,
            keyProperty: 'id'
        });
    });

    afterEach(() => {
        display.destroy();
        display = undefined;

        list.destroy();
        list = undefined;

        items = undefined;
    });

    describe('.constructor()', () => {
        it('should use filter from options', () => {
            const list = new List({
                items: [1, 2, 3, 4]
            });

            const display = new CollectionDisplay({
                collection: list,
                filter: (item) => item === 3
            });

            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents(), 3);
                count++;
            });
            assert.equal(count, 1);
        });

        it('should use group from options', () => {
            const list = new List({
                items: [
                    {id: 1, group: 1},
                    {id: 2, group: 2},
                    {id: 3, group: 1},
                    {id: 4, group: 3}
                ]
            });
            const display = new CollectionDisplay({
                collection: list,
                group: (item) => item.group
            });
            const groupedItems = [1, list.at(0), list.at(2), 2, list.at(1), 3, list.at(3)];

            display.each((item, i) => {
                assert.strictEqual(groupedItems[i], item.getContents());
            });
        });

        it('should use sort from options', () => {
            const list = new ObservableList({
                items: [5, 4, 3, 2, 1]
            });
            const display = new CollectionDisplay({
                collection: list,
                sort: (a, b) => a.collectionItem - b.collectionItem
            });
            const sortedItems = [1, 2, 3, 4, 5];

            display.each((item, i) => {
                assert.equal(sortedItems[i], item.getContents());
            });
        });

        it('should throw an error on invalid argument', () => {
            let display;

            assert.throws(() => {
                display = new CollectionDisplay({
                    collection: {} as any
                });
            });
            assert.throws(() => {
                display = new CollectionDisplay({
                    collection: 'a' as any
                });
            });
            assert.throws(() => {
                display = new CollectionDisplay({
                    collection: 1 as any
                });
            });
            assert.throws(() => {
                display = new CollectionDisplay({
                    collection: undefined
                });
            });

            assert.isUndefined(display);
        });

        it('should add an important property if Compute functor for sort used', () => {
            const importantProps = ['bar'];
            const functor = ComputeFunctor.create(
                (a, b) => a - b,
                ['foo']
            );
            const display = new CollectionDisplay({
                collection: list,
                sort: functor,
                importantItemProperties: importantProps
            });

            assert.isTrue(importantProps.indexOf('foo') > -1);
            assert.isTrue(importantProps.indexOf('bar') > -1);

            display.destroy();
        });

        it('should add an important property if Compute functor for group used', () => {
            const importantProps = ['bar'];
            const functor = ComputeFunctor.create(
                () => 'banana',
                ['foo']
            );
            const display = new CollectionDisplay({
                collection: list,
                group: functor,
                importantItemProperties: importantProps
            });

            assert.isTrue(importantProps.indexOf('foo') > -1);
            assert.isTrue(importantProps.indexOf('bar') > -1);

            display.destroy();
        });
    });

    describe('.getEnumerator()', () => {
        it('should return a display enumerator', () => {
            const display = new CollectionDisplay({
                collection: new ObservableList()
            });
            assert.isTrue(
                coreInstance.instanceOfModule(display.getEnumerator(), 'Controls/_display/CollectionEnumerator')
            );
        });

        context('if has repeatable ids', () => {
            let items: ObservableList<{id: string}>;
            let display: CollectionDisplay<{id: string}>;

            beforeEach(() => {
                items = new ObservableList({
                    items: [
                        {id: 'a'},
                        {id: 'aa'},
                        {id: 'ab'},
                        {id: 'b'},
                        {id: 'ba'},
                        {id: 'b'},
                        {id: 'bb'}
                    ]
                });

                display = new CollectionDisplay({
                    collection: items,
                    keyProperty: 'id'
                });
            });

            afterEach(() => {
                display.destroy();
                display = undefined;
                items = undefined;
            });

            it('should include repeatable elements if unique=false', () => {
                const enumerator = display.getEnumerator();
                const expected = ['a', 'aa', 'ab', 'b', 'ba', 'b', 'bb'];

                let index = 0;
                while (enumerator.moveNext()) {
                    const item = enumerator.getCurrent();
                    assert.strictEqual(item.getContents().id, expected[index]);
                    index++;
                }
                assert.equal(index, expected.length);
            });

            it('should skip repeatable elements if unique=true', () => {
                display.setUnique(true);

                const enumerator = display.getEnumerator();
                const expected = ['a', 'aa', 'ab', 'b', 'ba', 'bb'];

                let index = 0;
                while (enumerator.moveNext()) {
                    const item = enumerator.getCurrent();
                    assert.strictEqual(item.getContents().id, expected[index]);
                    index++;
                }
                assert.equal(index, expected.length);
            });
        });
    });

    describe('.each()', () => {
        it('should return every item in original order', () => {
            let ok = true;
            let index = 0;
            display.each((item) => {
                if (item.getContents() !== items[index]) {
                    ok = false;
                }
                index++;
            });
            assert.isTrue(ok);
        });

        it('should return every item index in original order', () => {
            let ok = true;
            let index = 0;
            display.each((item, innerIndex) => {
                if (index !== innerIndex) {
                    ok = false;
                }
                index++;
            });
            assert.isTrue(ok);
        });

        it('should return items in order of sort function', () => {
            const list = new RecordSet({
                rawData: [
                    {id: 1, title: 1},
                    {id: 2, title: 2},
                    {id: 3, title: 3},
                    {id: 4, title: 4}
                ],
                keyProperty: 'id'
            });
            const display = new CollectionDisplay({
                collection: list,
                importantItemProperties: ['title'],
                filter: (a) => a.get('title') < 3,
                sort: (a, b) => a.collectionItem.get('title') - b.collectionItem.get('title')
            });
            const sortedItems = [1, 4, 2];

            list.at(3).set('title', 1);
            const result = [];
            display.each((item) => {
                result.push(item.getContents().getKey());
            });
            assert.deepEqual(result, sortedItems);
        });

        it('should return groups and items together', () => {
            const expected = [];
            const groups = [];
            items.forEach((item) => {
                if (groups.indexOf(item.id) === -1) {
                    groups.push(item.id);
                    expected.push(item.id);
                }
                expected.push(item);
            });

            display.setGroup((item) => item.id);

            let count = 0;
            display.each((item, index) => {
                assert.equal(item.getContents(), expected[index]);
                count++;
            });
            assert.equal(count, expected.length);
        });

        it.skip('should remain empty group that match filter after remove last it member', () => {
            const items = [
                {id: 1, group: 1},
                {id: 2, group: 2}
            ];
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list,
                keyProperty: 'id',
                group: (item) => item.group,
                filter: () => true
            });
            const expected = [2, items[1], 1];
            let count = 0;

            list.removeAt(0);
            display.each((item, index) => {
                assert.equal(item.getContents(), expected[index], 'at ' + index);
                count++;
            });
            assert.equal(count, expected.length);
        });

        it('should return new group after prepend an item with filter', () => {
            const items = [
                {id: 1, group: 1},
                {id: 2, group: 2}
            ];
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list,
                keyProperty: 'id',
                group: (item) => item.group,
                filter: () => true
            });
            const item = {id: 2, group: 3};
            const expected = [3, item, 1, items[0], 2, items[1]];
            let count = 0;

            list.add(item, 0);

            display.each((item, index) => {
                assert.equal(item.getContents(), expected[index]);
                count++;
            });
            assert.equal(count, expected.length);
        });

        it('should remove empty groups after add an item', () => {
            const items = [
                {id: 1, group: 1},
                {id: 2, group: 2}
            ];
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list,
                keyProperty: 'id',
                group: (item) => item.group
            });
            const item = {id: 2, group: 3};
            const expected = [2, items[1], 3, item];
            let count = 0;

            list.removeAt(0);
            list.add(item);

            display.each((item, index) => {
                assert.equal(item.getContents(), expected[index]);
                count++;
            });
            assert.equal(count, expected.length);
        });

        it('should return groups and items together', () => {
            const expected = [];
            const groups = [];
            let count;
            items.forEach((item) => {
                if (groups.indexOf(item.id) === -1) {
                    groups.push(item.id);
                    expected.push(item.id);
                }
                expected.push(item);
            });

            display.setGroup((item) => item.id);

            count = 0;
            display.each((item, index) => {
                assert.equal(item.getContents(), expected[index]);
                count++;
            });
            assert.equal(count, expected.length);
        });
    });

    describe('.getCount()', () => {
        let items: number[];
        let list: ObservableList<number>;
        let display: CollectionDisplay<number>;

        beforeEach(() => {
            items = [1, 2, 3, 4];

            list = new ObservableList({items});

            display = new CollectionDisplay({
                collection: list,
                group: (item) => item % 2
            });
        });

        it('should consider groups', () => {
            assert.equal(display.getCount(), 1.5 * items.length);
        });

        it('should skip groups', () => {
            assert.equal(display.getCount(true), items.length);
        });
    });

    describe('.setFilter()', () => {
        function getItems(): number[] {
            return [1, 2, 3, 4];
        }

        it('should filter display by collection item', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const filter = (item) => item === 3;
            const display = new CollectionDisplay({
                collection: list
            });

            display.setFilter(filter);
            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents(), 3);
                count++;
            });
            assert.equal(count, 1);
        });

        it('should filter display by collection position', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const filter = (item, index) => index === 1;
            const display = new CollectionDisplay({
                collection: list
            });

            display.setFilter(filter);
            let count = 0;
            display.each((item) => {
                assert.equal(list.getIndex(item.getContents()), 1);
                count++;
            });
            assert.equal(count, 1);
        });

        it('should filter display by display item', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const filter = (item, index, displayItem) => displayItem.getContents() === 2;
            const display = new CollectionDisplay({
                collection: list
            });

            display.setFilter(filter);
            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents(), 2);
                count++;
            });
            assert.equal(count, 1);
        });

        it('should filter display by display index', () => {
            const filter = (item, index, displayItem, displayIndex) => displayIndex === 3;
            const sort = (a, b) => b.collectionItem - a.collectionItem;
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list,
                filter,
                sort
            });

            display.setFilter(filter);
            let count = 0;
            display.each((item) => {
                assert.equal(list.getIndex(item.getContents()), 0);
                count++;
            });
            assert.equal(count, 1);
        });

        it('should call filter for all items if it use display index', () => {
            const data = [{id: 1}, {id: 2}, {id: 3}];
            const list = new RecordSet({
                rawData: data
            });
            const display = new CollectionDisplay({
                collection: list,
                importantItemProperties: ['id'],
                filter: (item, index, displayItem, displayIndex) => {
                    count++;
                    return displayIndex > -1;
                }
            });

            let count = 0;
            list.at(0).set('id', 'foo');
            assert.equal(count, data.length);

            display.destroy();
            list.destroy();
        });

        it('should filter display use array of filters', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const filterA = (item) => item > 2;
            const filterB = (item) => item < 4;
            const display = new CollectionDisplay({
                collection: list
            });

            display.setFilter([filterA, filterB] as any);
            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents(), 3);
                count++;
            });
            assert.equal(count, 1);
        });

        it('should filter display use several filters', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const filterA = (item) => item > 2;
            const filterB = (item) => item < 4;
            const display = new CollectionDisplay({
                collection: list
            });

            display.setFilter(filterA, filterB);
            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents(), 3);
                count++;
            });
            assert.equal(count, 1);
        });

        // TODO Usually a reset event is fired on assign, however we've
        // disabled it in favour of the complete recreation of the collection.
        // Decide if this test is still applicable.
        it.skip('should filter display after assign an items', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const filter = (item) => item === 5 || item === 6;
            const display = new CollectionDisplay({
                collection: list
            });

            display.setFilter(filter);
            list.assign([4, 5, 6, 7]);
            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents(), 5 + count);
                count++;
            });
            assert.equal(count, 2);
        });

        it('should filter display after add item', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const filter = (item) => item === 3;
            const display = new CollectionDisplay({
                collection: list
            });

            display.setFilter(filter);
            list.add(4);
            list.add(3);
            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents(), 3);
                count++;
            });
            assert.equal(count, 2);
        });

        it('should filter display after remove item', () => {
            const list = new ObservableList({
                items: [1, 2, 3, 3]
            });
            const filter = (item) => item === 3;
            const display = new CollectionDisplay({
                collection: list
            });

            display.setFilter(filter);
            list.removeAt(3);
            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents(), 3);
                count++;
            });
            assert.equal(count, 1);
        });

        it('should filter display after replace item', () => {
            const list = new ObservableList({
                items: [1, 2, 3, 2]
            });
            const filter = (item) => item === 3;
            const display = new CollectionDisplay({
                collection: list
            });

            display.setFilter(filter);
            list.replace(3, 1);
            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents(), 3);
                count++;
            });
            assert.equal(count, 2);
        });

        it('should not refilter display after change item', () => {
            const changeModel = new Model({
                rawData: {max: 2}
            });
            const list = new ObservableList({
                items: [
                    new Model({
                        rawData: {max: 1}
                    }),
                    new Model({
                        rawData: {max: 3}
                    }),
                    new Model({
                        rawData: {max: 4}
                    }),
                    changeModel
                ]
            });
            const filter = (item) => item.get('max') === 3;
            const display = new CollectionDisplay({
                collection: list
            });

            display.setFilter(filter);
            changeModel.set('max', 3);
            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents().get('max'), 3);
                count++;
            });
            assert.equal(count, 1);
        });

        it('should refilter display after change item', () => {
            const changeModel = new Model({
                rawData: {max: 2}
            });
            const list = new ObservableList({
                items: [
                    new Model({
                        rawData: {max: 1}
                    }),
                    new Model({
                        rawData: {max: 3}
                    }),
                    new Model({
                        rawData: {max: 4}
                    }),
                    changeModel
                ]
            });
            const filter = (item) => item.get('max') === 3;
            const display = new CollectionDisplay({
                collection: list,
                importantItemProperties: ['max']
            });

            display.setFilter(filter);
            changeModel.set('max', 3);
            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents().get('max'), 3);
                count++;
            });
            assert.equal(count, 2);
        });
    });

    describe('.getFilter()', () => {
        it('should return a display filters', () => {
            const display = new CollectionDisplay({
                collection: new ObservableList()
            });
            const filter = () => {
                return true;
            };

            display.setFilter(filter);
            assert.deepEqual(display.getFilter(), [filter]);
            display.setFilter(filter);
            assert.deepEqual(display.getFilter(), [filter]);
        });
    });

    describe('.addFilter()', () => {
        function getItems(): number[] {
            return [1, 2, 3, 4];
        }

        it('should add a filter', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const filter = (item) => item === 3;
            const display = new CollectionDisplay({
                collection: list
            });

            display.addFilter(filter);
            let count = 0;
            display.each((item) => {
                assert.equal(item.getContents(), 3);
                count++;
            });
            assert.equal(count, 1);
        });

        it('should trigger onCollectionChange', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = [{
                action: IBindCollection.ACTION_REMOVE,
                newItems: [],
                newItemsIndex: 0,
                oldItems: [display.at(0), display.at(1)],
                oldItemsIndex: 0
            }, {
                action: IBindCollection.ACTION_REMOVE,
                newItems: [],
                newItemsIndex: 0,
                oldItems: [display.at(3)],
                oldItemsIndex: 1
            }];
            const given = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex
                });
            };
            const filter = (item) => item === 3;

            display.subscribe('onCollectionChange', handler);
            display.addFilter(filter);
            display.unsubscribe('onCollectionChange', handler);

            for (let i = 0; i < Math.max(expected.length, given.length); i++) {
                assert.equal(given[i].action, expected[i].action);
                assert.deepEqual(given[i].newItems, expected[i].newItems);
                assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
            }
        });
    });

    describe('.removeFilter()', () => {
        function getItems(): number[] {
            return [1, 2, 3, 4];
        }

        it('should remove a filter', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const filter = (item) => item === 3;
            const display = new CollectionDisplay({
                collection: list,
                filter
            });

            display.removeFilter(filter);
            let count = 0;
            display.each((item, index) => {
                assert.equal(item.getContents(), list.at(index));
                count++;
            });
            assert.equal(count, list.getCount());
        });

        it('should trigger onCollectionChange', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = [{
                action: IBindCollection.ACTION_ADD,
                newItems: [display.at(0), display.at(1)],
                newItemsIndex: 0,
                oldItems: [],
                oldItemsIndex: 0
            }, {
                action: IBindCollection.ACTION_ADD,
                newItems: [display.at(3)],
                newItemsIndex: 3,
                oldItems: [],
                oldItemsIndex: 0
            }];
            const given = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex
                });
            };
            const filter = (item) => item === 3;

            display.setFilter(filter);
            display.subscribe('onCollectionChange', handler);
            display.removeFilter(filter);
            display.unsubscribe('onCollectionChange', handler);

            for (let i = 0; i < Math.max(expected.length, given.length); i++) {
                assert.equal(given[i].action, expected[i].action);
                assert.deepEqual(given[i].newItems, expected[i].newItems);
                assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
            }
        });
    });

    describe('.setSort()', () => {
        const getItems = () => {
            return [1, 2, 3, 4];
        };
        const getSortedItems = () => {
            return [4, 3, 2, 1];
        };
        const sort = (a, b) => b.collectionItem - a.collectionItem;

        it('should sort display', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const sortedItems = getSortedItems();
            const display = new CollectionDisplay({
                collection: list
            });

            display.setSort(sort);
            display.each((item, i) => {
                assert.equal(sortedItems[i], item.getContents());
            });
        });

        it('should sort display use several sorters', () => {
            const items = [
                {id: 0, x: 1, y: 1},
                {id: 1, x: 1, y: 2},
                {id: 2, x: 2, y: 1},
                {id: 3, x: 2, y: 2}
            ];
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const sortX = (a, b) => a.collectionItem.x - b.collectionItem.x;
            const sortY = (a, b) => b.collectionItem.y - a.collectionItem.y;
            const expected = [1, 3, 0, 2];

            display.setSort(sortY, sortX);
            display.each((item, i) => {
                assert.equal(item.getContents().id, expected[i]);
            });
        });

        it('should trigger onCollectionChange', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = [{
                action: IBindCollection.ACTION_MOVE,
                newItems: [display.at(3)],
                newItemsIndex: 0,
                oldItems: [display.at(3)],
                oldItemsIndex: 3
            }, {
                action: IBindCollection.ACTION_MOVE,
                newItems: [display.at(2)],
                newItemsIndex: 1,
                oldItems: [display.at(2)],
                oldItemsIndex: 3
            }, {
                action: IBindCollection.ACTION_MOVE,
                newItems: [display.at(1)],
                newItemsIndex: 2,
                oldItems: [display.at(1)],
                oldItemsIndex: 3
            }];
            const given = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex
                });
            };

            display.subscribe('onCollectionChange', handler);
            display.setSort(sort);
            display.unsubscribe('onCollectionChange', handler);

            assert.deepEqual(given, expected);
        });

        it('should reset a sort display', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const sortedItems = getItems();
            const display = new CollectionDisplay({
                collection: list
            });

            display.setSort(sort);
            display.setSort();
            display.each((item, i) => {
                assert.equal(sortedItems[i], item.getContents());
            });
        });

        it('should sort display after add item', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const sortedItems = [5, 4, 3, 2, 1];
            const display = new CollectionDisplay({
                collection: list
            });

            display.setSort(sort);
            list.add(5);
            display.each((item, i) => {
                assert.equal(sortedItems[i], item.getContents());
            });
        });

        it('should sort display after remove item', () => {
            const list = new ObservableList({
                items: [1, 2, 10, 3, 4]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = [4, 3, 2, 1];
            const given = [];

            display.setSort(sort);
            list.removeAt(2);
            display.each((item) => {
                given.push(item.getContents());
            });

            assert.deepEqual(given, expected);
        });

        it('should sort display after replace item', () => {
            const list = new ObservableList({
                items: [1, 2, 2, 3, 5]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = [5, 4, 3, 2, 1];

            display.setSort(sort);
            list.replace(4, 2);
            display.each((item, i) => {
                assert.equal(expected[i], item.getContents());
            });
        });

        it('should not resort display after change item', () => {
            const changeModel = new Model({
                rawData: {max: 2}
            });
            const list = new ObservableList({
                items: [
                    new Model({
                        rawData: {max: 1}
                    }),
                    new Model({
                        rawData: {max: 3}
                    }),
                    new Model({
                        rawData: {max: 4}
                    }),
                    changeModel
                ]
            });
            const sortedItems = [4, 3, 10, 1];
            const display = new CollectionDisplay({
                collection: list
            });

            display.setSort((a, b) => b.collectionItem.get('max') - a.collectionItem.get('max'));
            changeModel.set('max', 10);
            display.each((item, i) => {
                assert.equal(sortedItems[i], item.getContents().get('max'));
            });
        });

        it('should resort display after change item', () => {
            const changeModel = new Model({
                rawData: {max: 2}
            });
            const list = new ObservableList({
                items: [
                    new Model({
                        rawData: {max: 1}
                    }),
                    new Model({
                        rawData: {max: 3}
                    }),
                    new Model({
                        rawData: {max: 4}
                    }),
                    changeModel
                ]
            });
            const sortedItems = [10, 4, 3, 1];
            const display = new CollectionDisplay({
                collection: list,
                importantItemProperties: ['max']
            });

            display.setSort((a, b) => b.collectionItem.get('max') - a.collectionItem.get('max'));
            changeModel.set('max', 10);
            display.each((item, i) => {
                assert.equal(sortedItems[i], item.getContents().get('max'));
            });
        });

        it('should add an important property if Compute functor used', () => {
            const importantProps = ['bar'];
            const functor = ComputeFunctor.create(
                (a, b) => a - b,
                ['foo']
            );
            const display = new CollectionDisplay({
                collection: list,
                importantItemProperties: importantProps
            });

            display.setSort(functor);
            assert.isTrue(importantProps.indexOf('foo') > -1);
            assert.isTrue(importantProps.indexOf('bar') > -1);
        });

        it('should remove an important property if Compute functor no longer used', () => {
            const importantProps = ['bar'];
            const functor = ComputeFunctor.create(
                (a, b) => a - b,
                ['foo']
            );
            const display = new CollectionDisplay({
                collection: list,
                sort: functor,
                importantItemProperties: importantProps
            });

            display.setSort();
            assert.isTrue(importantProps.indexOf('foo') === -1);
            assert.isTrue(importantProps.indexOf('bar') > -1);
        });
    });

    describe('.getSort()', () => {
        it('should return a display sort', () => {
            const sort = () => {
                return 0;
            };
            const display = new CollectionDisplay({
                collection: new ObservableList(),
                sort
            });

            assert.deepEqual(display.getSort(), [sort]);
        });
    });

    describe('.addSort()', () => {
        const getItems = () => [1, 2, 3, 4];
        const getSortedItems = () => [4, 3, 2, 1];
        const sort = (a, b) => b.collectionItem - a.collectionItem;

        it('should sort display', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const sortedItems = getSortedItems();
            const display = new CollectionDisplay({
                collection: list
            });

            display.addSort(sort);
            display.each((item, i) => {
                assert.equal(item.getContents(), sortedItems[i]);
            });
        });

        it('should trigger onCollectionChange', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = [{
                action: IBindCollection.ACTION_MOVE,
                newItems: [display.at(3)],
                newItemsIndex: 0,
                oldItems: [display.at(3)],
                oldItemsIndex: 3
            }, {
                action: IBindCollection.ACTION_MOVE,
                newItems: [display.at(2)],
                newItemsIndex: 1,
                oldItems: [display.at(2)],
                oldItemsIndex: 3
            }, {
                action: IBindCollection.ACTION_MOVE,
                newItems: [display.at(1)],
                newItemsIndex: 2,
                oldItems: [display.at(1)],
                oldItemsIndex: 3
            }];
            const given = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex
                });
            };

            display.subscribe('onCollectionChange', handler);
            display.addSort(sort);
            display.unsubscribe('onCollectionChange', handler);

            for (let i = 0; i < Math.max(expected.length, given.length); i++) {
                assert.equal(given[i].action, expected[i].action);
                assert.deepEqual(given[i].newItems, expected[i].newItems);
                assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
            }
        });
    });

    describe('.removeSort()', () => {
        const getItems = () => [1, 2, 3, 4];
        const sort = (a, b) => b.collectionItem - a.collectionItem;

        it('should sort display', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const unsortedItems = getItems();
            const display = new CollectionDisplay({
                collection: list,
                sort
            });

            display.removeSort(sort);
            display.each((item, i) => {
                assert.equal(item.getContents(), unsortedItems[i]);
            });
        });

        it('should trigger onCollectionChange', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list,
                sort
            });
            const expected = [{
                action: IBindCollection.ACTION_MOVE,
                newItems: [display.at(3)],
                newItemsIndex: 0,
                oldItems: [display.at(3)],
                oldItemsIndex: 3
            }, {
                action: IBindCollection.ACTION_MOVE,
                newItems: [display.at(2)],
                newItemsIndex: 1,
                oldItems: [display.at(2)],
                oldItemsIndex: 3
            }, {
                action: IBindCollection.ACTION_MOVE,
                newItems: [display.at(1)],
                newItemsIndex: 2,
                oldItems: [display.at(1)],
                oldItemsIndex: 3
            }];
            const given = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex
                });
            };

            display.subscribe('onCollectionChange', handler);
            display.removeSort(sort);
            display.unsubscribe('onCollectionChange', handler);

            for (let i = 0; i < Math.max(expected.length, given.length); i++) {
                assert.equal(given[i].action, expected[i].action);
                assert.deepEqual(given[i].newItems, expected[i].newItems);
                assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
            }
        });
    });

    describe('.setGroup()', () => {
        function getItems(): IGroupItem[] {
            return [
                {id: 1, group: 1},
                {id: 2, group: 2},
                {id: 3, group: 1},
                {id: 4, group: 2}
            ];
        }

        it('should add an important property if Compute functor used', () => {
            const importantProps = ['bar'];
            const functor = ComputeFunctor.create(() => {
                return 'banana';
            }, ['foo']);
            const display = new CollectionDisplay({
                collection: list,
                importantItemProperties: importantProps
            });

            display.setGroup(functor);
            assert.isTrue(importantProps.indexOf('foo') > -1);
            assert.isTrue(importantProps.indexOf('bar') > -1);
        });

        it('should group the display', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const groupedItems = [
                1,
                list.at(0),
                list.at(2),
                2,
                list.at(1),
                list.at(3)
            ];
            const display = new CollectionDisplay({
                collection: list
            });

            display.setGroup((item) => item.group);
            display.each((item, i) => {
                assert.equal(groupedItems[i], item.getContents());
            });
        });

        it('should group the display with filter', () => {
            const items = [
                {id: 1, group: 1, enabled: true},
                {id: 2, group: 2, enabled: false},
                {id: 3, group: 3, enabled: true},
                {id: 4, group: 4, enabled: false}
            ];
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list,
                filter: (item, index, collectionItem, position, hasMembers) => {
                    if (collectionItem instanceof GroupItem) {
                        return hasMembers;
                    }
                    return item.enabled;
                }
            });
            const expectedItems = [1, items[0], 3, items[2]];

            let count = 0;
            display.setGroup((item) => item.group);
            display.each((item) => {
                assert.strictEqual(item.getContents(), expectedItems[count]);
                count++;
            });
            assert.equal(count, expectedItems.length);
        });

        it('should skip repeatable groups with filter', () => {
            const items = [
                {id: 1, group: 1, enabled: true},
                {id: 2, group: 2, enabled: false},
                {id: 3, group: 3, enabled: true},
                {id: 4, group: 4, enabled: false},
                {id: 5, group: 3, enabled: true},
                {id: 6, group: 5, enabled: true}
            ];
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list,
                filter: (item, index, collectionItem, position, hasMembers) => {
                    if (collectionItem instanceof GroupItem) {
                        return hasMembers;
                    }
                    return item.enabled;
                }
            });
            const expectedItems = [1, items[0], 3, items[2], items[4], 5, items[5]];

            let count = 0;
            display.setGroup((item) => item.group);
            display.each((item) => {
                assert.strictEqual(item.getContents(), expectedItems[count]);
                count++;
            });
            assert.equal(count, expectedItems.length);
        });

        it('should enum items in original order', () => {
            const items = [
                {id: 1, group: 1},
                {id: 2, group: 1},
                {id: 3, group: 1},
                {id: 4, group: 1},
                {id: 5, group: 2},
                {id: 6, group: 2},
                {id: 7, group: 2},
                {id: 8, group: 2},
                {id: 9, group: 3},
                {id: 10, group: 3},
                {id: 11, group: 3},
                {id: 12, group: 3},
                {id: 13, group: 4},
                {id: 14, group: 4},
                {id: 15, group: 4},
                {id: 16, group: 4},
                {id: 17, group: 5},
                {id: 18, group: 5},
                {id: 19, group: 5},
                {id: 20, group: 5},
                {id: 21, group: 6},
                {id: 22, group: 6},
                {id: 23, group: 6},
                {id: 24, group: 6}
            ];
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list
            });

            let index = 0;
            display.setGroup((item) => item.group);
            display.each((item) => {
                if (item instanceof GroupItem) {
                    assert.strictEqual(item.getContents(), items[index + 1].group);
                } else {
                    assert.strictEqual(item.getContents(), items[index]);
                    index++;
                }
            });
            assert.strictEqual(index, items.length);
        });

        it('should enum item in groups in reverse order', () => {
            const items = [
                {id: 1, group: 1},
                {id: 2, group: 1},
                {id: 3, group: 1},
                {id: 4, group: 1},
                {id: 5, group: 2},
                {id: 6, group: 2},
                {id: 7, group: 2},
                {id: 8, group: 2},
                {id: 9, group: 3},
                {id: 10, group: 3},
                {id: 11, group: 3},
                {id: 12, group: 3},
                {id: 13, group: 4},
                {id: 14, group: 4},
                {id: 15, group: 4},
                {id: 16, group: 4}
            ];
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = [
                4, items[15], items[14], items[13], items[12],
                3, items[11], items[10], items[9],  items[8],
                2, items[7],  items[6],  items[5],  items[4],
                1, items[3],  items[2],  items[1],  items[0]
            ];

            let index = 0;
            display.setSort((a, b) => b.index - a.index);
            display.setGroup((item) => item.group);
            display.each((item, position) => {
                assert.strictEqual(item.getContents(), expected[index], 'at ' + position);
                index++;
            });
            assert.strictEqual(index, expected.length);
        });

        it('should reset a group of the display', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const expected = [
                list.at(0),
                list.at(1),
                list.at(2),
                list.at(3)
            ];
            const display = new CollectionDisplay({
                collection: list
            });

            display.setGroup((item) => item.group);
            display.setGroup();
            display.each((item, i) => {
                assert.equal(expected[i], item.getContents());
            });
        });

        it('should regroup the display after add an item', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const added = {id: 5, group: 1};
            const expected = [
                1,
                list.at(0),
                list.at(2),
                added,
                2,
                list.at(1),
                list.at(3)
            ];

            display.setGroup((item) => item.group);
            list.add(added);
            display.each((item, i) => {
                assert.equal(expected[i], item.getContents());
            });
        });

        it('should regroup the display after remove an item', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = [
                1,
                list.at(0),
                2,
                list.at(1),
                list.at(3)
            ];

            display.setGroup((item) => item.group);
            list.removeAt(2);
            display.each((item, i) => {
                assert.equal(expected[i], item.getContents());
            });
        });

        it('should regroup the display after replace an item', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const replace = {id: 5, group: 2};
            const expected = [1, list.at(0), 2, list.at(1), replace, list.at(3)];

            display.setGroup((item) => item.group);
            list.replace(replace, 2);
            display.each((item, i) => {
                assert.equal(expected[i], item.getContents());
            });
        });

        it('should regroup the display after change an item', () => {
            const changeModel = new Model({
                rawData: {id: 4, group: 2}
            });
            const list = new ObservableList({
                items: [
                    new Model({
                        rawData: {id: 1, group: 1}
                    }),
                    new Model({
                        rawData: {id: 2, group: 2}
                    }),
                    new Model({
                        rawData: {id: 3, group: 1}
                    }),
                    changeModel
                ]
            });
            const display = new CollectionDisplay({
                collection: list,
                importantItemProperties: ['group']
            });
            const expected = [
                1,
                list.at(0),
                list.at(2),
                list.at(3),
                2,
                list.at(1)
            ];

            display.setGroup((item) => item.get('group'));
            changeModel.set('group', 1);
            display.each((item, i) => {
                assert.equal(expected[i], item.getContents());
            });
        });

        it('should lookup groups order after add an item in the new group', () => {
            const list = new ObservableList({
                items: [
                    {id: 1, group: 2},
                    {id: 2, group: 3},
                    {id: 3, group: 2}
                ]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const added = {id: 4, group: 1};
            const expected = [
                2,
                list.at(0),
                list.at(2),
                1,
                added,
                3,
                list.at(1)
            ];

            display.setGroup((item) => item.group);
            list.add(added, 1);
            display.each((item, i) => {
                assert.equal(expected[i], item.getContents());
            });
        });

        it('should lookup groups order after add an items some of which in the new group', () => {
            const list = new ObservableList({
                items: [
                    {id: 1, group: 2},
                    {id: 2, group: 3},
                    {id: 3, group: 2}
                ]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const newItems = [
                {id: 4, group: 2},
                {id: 5, group: 1}
            ];
            const expected = [
                2,
                list.at(0),
                list.at(2),
                newItems[0],
                3,
                list.at(1),
                1,
                newItems[1]
            ];

            display.setGroup((item) => item.group);
            list.append(newItems);
            display.each((item, i) => {
                assert.equal(expected[i], item.getContents());
            });
        });

        // TODO Usually a reset event is fired on assign, however we've
        // disabled it in favour of the complete recreation of the collection.
        // Decide if this test is still applicable.
        it.skip('should restore groups after the list will be assigned new items', () => {
            const list = new ObservableList({
                items: [
                    {id: 1, group: 2},
                    {id: 2, group: 3},
                    {id: 3, group: 2}
                ]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const replace = [
                {id: 1, group: 3},
                {id: 2, group: 3},
                {id: 3, group: 2}
            ];
            const expected = [
                3,
                replace[0],
                replace[1],
                2,
                replace[2]
            ];

            display.setGroup((item) => item.group);
            list.assign(replace);
            display.each((item, i) => {
                assert.equal(expected[i], item.getContents());
            });
        });
    });

    describe('.getGroupItems()', () => {
        function getItems(): IGroupItem[] {
            return [
                {id: 1, group: 1},
                {id: 2, group: 2},
                {id: 3, group: 1},
                {id: 4, group: 2}
            ];
        }

        const check = (items, expected) => {
            assert.equal(items.length, expected.length);
            for (let index = 0; index < expected.length; index++) {
                assert.equal(expected[index], items[index].getContents().id);
            }
        };

        it('should return group items', () => {
            const list = new List({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });

            display.setGroup((item) => item.group);

            check(display.getGroupItems(0), []);
            check(display.getGroupItems(1), [1, 3]);
            check(display.getGroupItems(2), [2, 4]);
            check(display.getGroupItems(3), []);
        });

        it('should return group for new items', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });

            display.setGroup((item) => item.group);

            list.add({id: 5, group: 3}, 2);

            check(display.getGroupItems(0), []);
            check(display.getGroupItems(1), [1, 3]);
            check(display.getGroupItems(2), [2, 4]);
            check(display.getGroupItems(3), [5]);
            check(display.getGroupItems(4), []);
        });

        it('should return empty group for old items', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });

            display.setGroup((item) => item.group);

            list.removeAt(2);

            check(display.getGroupItems(0), []);
            check(display.getGroupItems(1), [1]);
            check(display.getGroupItems(2), [2, 4]);
            check(display.getGroupItems(3), []);

            list.removeAt(0);

            check(display.getGroupItems(0), []);
            check(display.getGroupItems(1), []);
            check(display.getGroupItems(2), [2, 4]);
            check(display.getGroupItems(3), []);
        });
    });

    describe('.getGroupByIndex()', () => {
        function getItems(): IGroupItem[] {
            return [
                {id: 1, group: 1},
                {id: 2, group: 2},
                {id: 3, group: 1},
                {id: 4, group: 2}
            ];
        }

        it('should return group id', () => {
            const list = new List({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = [1, 1, 1, 2, 2, 2];

            display.setGroup((item) => item.group);

            for (let index = 0; index < expected.length; index++) {
                assert.equal(
                    display.getGroupByIndex(index),
                    expected[index]
                );
            }
        });

        it('should return valid group id in filtered mode', () => {
            const list = new List({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list,
                group: (item) => item.group,
                filter: (item) => item && item.id !== 2
            });
            const expected = [1, 1, 1, 2, 2];

            for (let index = 0; index < expected.length; index++) {
                assert.equal(
                    display.getGroupByIndex(index),
                    expected[index]
                );
            }
        });
    });

    describe('.getKeyProperty()', () => {
        it('should return given value', () => {
            assert.equal(display.getKeyProperty(), 'id');
        });
    });

    describe('.isUnique()', () => {
        it('should return false by default', () => {
            assert.isFalse(display.isUnique());
        });
    });

    describe('.setUnique()', () => {
        it('should change the unique option', () => {
            display.setUnique(true);
            assert.isTrue(display.isUnique());

            display.setUnique(false);
            assert.isFalse(display.isUnique());
        });
    });

    context('shortcuts', () => {
        let list: ObservableList<number>;
        let display: CollectionDisplay<number>;

        beforeEach(() => {
            list = new ObservableList({
                items: [1, 2, 3, 4]
            });
            display = new CollectionDisplay({
                collection: list
            });
        });

        describe('.getSourceIndexByIndex()', () => {
            it('should return equal indexes', () => {
                display.each((item, index) => {
                    assert.equal(display.getSourceIndexByIndex(index), index);
                });
            });

            it('should return inverted indexes', () => {
                const max = display.getCount() - 1;
                display.setSort((a, b) => b.collectionItem - a.collectionItem);
                display.each((item, index) => {
                    assert.equal(display.getSourceIndexByIndex(index), max - index);
                });
            });

            it('should return -1', () => {
                assert.equal(display.getSourceIndexByIndex(-1), -1);
                assert.equal(display.getSourceIndexByIndex(99), -1);
                assert.equal(display.getSourceIndexByIndex(null), -1);
                assert.equal(display.getSourceIndexByIndex(undefined), -1);
            });
        });

        describe('.getSourceIndexByItem()', () => {
            it('should return equal indexes', () => {
                display.each((item, index) => {
                    assert.equal(display.getSourceIndexByItem(item), index);
                });
            });

            it('should return inverted indexes', () => {
                const max = display.getCount() - 1;
                display.setSort((a, b) => b.collectionItem - a.collectionItem);
                display.each((item, index) => {
                    assert.equal(display.getSourceIndexByItem(item), max - index);
                });
            });

            it('should return -1', () => {
                assert.equal(display.getSourceIndexByItem({} as any), -1);
                assert.equal(display.getSourceIndexByItem(null), -1);
                assert.equal(display.getSourceIndexByItem(undefined), -1);
            });
        });

        describe('.getIndexBySourceIndex()', () => {
            it('should return equal indexes', () => {
                list.each((item, index) => {
                    assert.equal(display.getIndexBySourceIndex(index), index);
                });
            });

            it('should return inverted indexes', () => {
                const max = display.getCount() - 1;
                display.setSort((a, b) => b.collectionItem - a.collectionItem);
                list.each((item, index) => {
                    assert.equal(display.getIndexBySourceIndex(index), max - index);
                });
            });

            it('should return -1', () => {
                assert.equal(display.getIndexBySourceIndex(-1), -1);
                assert.equal(display.getIndexBySourceIndex(99), -1);
                assert.equal(display.getIndexBySourceIndex(null), -1);
                assert.equal(display.getIndexBySourceIndex(undefined), -1);
            });
        });

        describe('.getIndexBySourceItem()', () => {
            it('should return equal indexes', () => {
                list.each((item, index) => {
                    assert.equal(display.getIndexBySourceItem(item), index);
                });
            });

            it('should return inverted indexes', () => {
                const max = display.getCount() - 1;
                display.setSort((a, b) => b.collectionItem - a.collectionItem);
                list.each((item, index) => {
                    assert.equal(display.getIndexBySourceItem(item), max - index);
                });
            });

            it('should return -1', () => {
                assert.equal(display.getIndexBySourceItem({} as any), -1);
                assert.equal(display.getIndexBySourceItem(null), -1);
                assert.equal(display.getIndexBySourceItem(undefined), -1);
            });
        });

        describe('.getItemBySourceIndex()', () => {
            it('should return equal indexes', () => {
                list.each((item, index) => {
                    assert.strictEqual(display.getItemBySourceIndex(index), display.at(index));
                });
            });

            it('should return inverted indexes', () => {
                const max = display.getCount() - 1;
                display.setSort((a, b) => b.collectionItem - a.collectionItem);
                list.each((item, index) => {
                    assert.strictEqual(display.getItemBySourceIndex(index), display.at(max - index));
                });
            });

            it('should return undefined', () => {
                assert.isUndefined(display.getItemBySourceIndex(-1));
                assert.isUndefined(display.getItemBySourceIndex(99));
                assert.isUndefined(display.getItemBySourceIndex(null));
                assert.isUndefined(display.getItemBySourceIndex(undefined));
            });
        });

        describe('.getItemBySourceItem()', () => {
            it('should return equal indexes', () => {
                list.each((item, index) => {
                    assert.strictEqual(display.getItemBySourceItem(item), display.at(index));
                });
            });

            it('should return inverted indexes', () => {
                const max = display.getCount() - 1;
                display.setSort((a, b) => b.collectionItem - a.collectionItem);
                list.each((item, index) => {
                    assert.strictEqual(display.getItemBySourceItem(item), display.at(max - index));
                });
            });

            it('should return undefined', () => {
                assert.isUndefined(display.getItemBySourceItem({} as any));
                assert.isUndefined(display.getItemBySourceItem(null));
                assert.isUndefined(display.getItemBySourceItem(undefined));
            });
        });
    });

    describe('.setEventRaising()', () => {
        it('should enable and disable onCurrentChange', () => {
            let fired = false;
            const handler = () => {
                fired = true;
            };

            display.subscribe('onCurrentChange', handler);

            display.setEventRaising(true);
            display.moveToNext();
            assert.isTrue(fired);

            fired = false;
            display.setEventRaising(false);
            display.moveToNext();
            assert.isFalse(fired);

            display.unsubscribe('onCurrentChange', handler);
        });

        it('should enable and disable onCollectionChange', () => {
            let fired = false;
            const handler = () => {
                fired = true;
            };

            display.subscribe('onCollectionChange', handler);

            display.setEventRaising(true);
            list.add({id: 999});
            assert.isTrue(fired);

            fired = false;
            display.setEventRaising(false);
            list.add({id: 1000});
            assert.isFalse(fired);

            display.unsubscribe('onCollectionChange', handler);
        });

        it('should enable and disable onBeforeCollectionChange when unfrozen without session', () => {
            let fired = false;
            const handler = () => {
                fired = true;
            };

            display.subscribe('onBeforeCollectionChange', handler);

            display.setEventRaising(false);
            list.add({id: 999});
            display.setEventRaising(true, true);
            display.unsubscribe('onBeforeCollectionChange', handler);

            assert.isFalse(fired);
        });

        it('should save original element if source item has been removed and added in one transaction', () => {
            list.setEventRaising(false, true);
            const item = list.at(0);
            const displaysItem = display.getItemBySourceItem(item);
            list.removeAt(0);
            list.add(item, 1);
            list.setEventRaising(true, true);
            assert.equal(display.getItemBySourceItem(item), displaysItem);
        });

        it('should fire after wake up', (done) => {
            const actions = [IBindCollection.ACTION_REMOVE, IBindCollection.ACTION_ADD];
            const contents = [list.at(0), list.at(0)];
            let fireId = 0;
            const handler = (event, action, newItems, newItemsIndex, oldItems) => {
                try {
                    assert.strictEqual(action, actions[fireId]);
                    switch (action) {
                        case IBindCollection.ACTION_ADD:
                            assert.strictEqual(newItems[0].getContents(), contents[fireId]);
                            break;
                        case IBindCollection.ACTION_REMOVE:
                        case IBindCollection.ACTION_MOVE:
                            assert.strictEqual(oldItems[0].getContents(), contents[fireId]);
                            break;
                    }
                    if (fireId === actions.length - 1) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
                fireId++;
            };

            display.subscribe('onCollectionChange', handler);
            display.setEventRaising(false, true);

            const item = list.at(0);
            list.removeAt(0);
            list.add(item);

            display.setEventRaising(true, true);
            display.unsubscribe('onCollectionChange', handler);
        });
    });

    describe('.isEventRaising()', () => {
        it('should return true by default', () => {
            assert.isTrue(display.isEventRaising());
        });

        it('should return true if enabled', () => {
            display.setEventRaising(true);
            assert.isTrue(display.isEventRaising());
        });

        it('should return false if disabled', () => {
            display.setEventRaising(false);
            assert.isFalse(display.isEventRaising());
        });
    });

    describe('.concat()', () => {
        it('should throw an error anyway', () => {
            assert.throws(() => {
                (display as any).concat(new List());
            });
            assert.throws(() => {
                (display as any).concat();
            });
        });
    });

    describe('.getCollection()', () => {
        it('should return source collection', () => {
            assert.strictEqual(
                list,
                display.getCollection() as any
            );
        });
    });

    describe('.getItems()', () => {
        it('should return array of items', () => {
            const items = display.getItems();
            assert.isTrue(items.length > 0);
            for (let i = 0; i < items.length; i++) {
                assert.strictEqual(
                    items[i],
                    display.at(i)
                );
            }
        });
    });

    describe('.getItemUid()', () => {
        it('should return model\'s primary key value as String', () => {
            const list = new ObservableList({
                items: [
                    new Model({
                        rawData: {id: 1, foo: 'bar'},
                        keyProperty: 'foo'
                    })
                ]
            });
            const display = new CollectionDisplay({
                collection: list,
                keyProperty: 'id'
            });

            assert.strictEqual(display.getItemUid(display.at(0)), 'bar');
        });

        it('should return keyProperty value as String', () => {
            const list = new ObservableList({
                items: [{id: 1}]
            });
            const display = new CollectionDisplay({
                collection: list,
                keyProperty: 'id'
            });

            assert.strictEqual(display.getItemUid(display.at(0)), '1');
        });

        it('should return same value for same item', () => {
            const list = new ObservableList({
                items: [{id: 'foo'}]
            });
            const display = new CollectionDisplay({
                collection: list,
                keyProperty: 'id'
            });
            const item = display.at(0);

            assert.strictEqual(display.getItemUid(item), 'foo');
            assert.strictEqual(display.getItemUid(item), 'foo');
        });

        it('should return variuos values for items with the same keyProperty value', () => {
            const list = new ObservableList({
                items: [
                    {id: 'foo'},
                    {id: 'bar'},
                    {id: 'foo'},
                    {id: 'foo'}
                ]
            });
            const display = new CollectionDisplay({
                collection: list,
                keyProperty: 'id'
            });

            assert.strictEqual(display.getItemUid(display.at(0)), 'foo');
            assert.strictEqual(display.getItemUid(display.at(1)), 'bar');
            assert.strictEqual(display.getItemUid(display.at(2)), 'foo-1');
            assert.strictEqual(display.getItemUid(display.at(3)), 'foo-2');
        });

        it('should throw an error if keyProperty is empty', () => {
            const list = new ObservableList({
                items: [{id: 1}]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const item = display.at(0);

            assert.throws(() => {
                display.getItemUid(item);
            });
        });
    });

    describe('.getFirst()', () => {
        it('should return first item', () => {
            assert.strictEqual(display.getFirst(), display.at(0));
        });

        it('should skip groups', () => {
            const items = [1, 2];
            const list = new List({
                items
            });
            const display = new CollectionDisplay({
                collection: list,
                group: (item) => item % 2
            });

            assert.strictEqual(display.getFirst(), display.at(1));
        });
    });

    describe('.getLast()', () => {
        it('should return last item', () => {
            assert.strictEqual(display.getLast(), display.at(display.getCount() - 1));
        });
    });

    describe('.getNext()', () => {
        it('should return next item', () => {
            const item = display.at(0);
            assert.strictEqual(display.getNext(item), display.at(1));
        });

        it('should skip groups', () => {
            const items = [1, 2, 3];
            const list = new List({
                items
            });
            const display = new CollectionDisplay({
                collection: list,
                group: (item) => item % 2
            });

            let item = display.at(1); // contents = 1
            assert.strictEqual(display.getNext(item), display.at(2)); // contents = 3

            item = display.at(2); // contents = 3
            assert.strictEqual(display.getNext(item), display.at(4)); // contents = 2

            item = display.at(4); // contents = 2
            assert.isUndefined(display.getNext(item));
        });
    });

    describe('.getPrevious()', () => {
        it('should return previous item', () => {
            const item = display.at(1);
            assert.strictEqual(display.getPrevious(item), display.at(0));
        });

        it('should skip groups', () => {
            const items = [1, 2, 3];
            const list = new List({
                items
            });
            const display = new CollectionDisplay({
                collection: list,
                group: (item) => item % 2
            });

            let item = display.at(1); // contents = 1
            assert.isUndefined(display.getPrevious(item));

            item = display.at(2); // contents = 3
            assert.strictEqual(display.getPrevious(item), display.at(1)); // contents = 1

            item = display.at(4); // contents = 2
            assert.strictEqual(display.getPrevious(item), display.at(2)); // contents = 3
        });
    });

    describe('.getCurrent()', () => {
        it('should return undefined by default', () => {
            assert.isUndefined(display.getCurrent());
        });

        it('should change by item enumeration', () => {
            let index = 0;
            while (display.moveToNext()) {
                assert.strictEqual(items[index], display.getCurrent().getContents());
                index++;
            }
            assert.strictEqual(items[items.length - 1], display.getCurrent().getContents());
        });
    });

    describe('.getCurrentPosition()', () => {
        it('should return -1 by default', () => {
            assert.strictEqual(-1, display.getCurrentPosition());
        });

        it('should change through navigation', () => {
            let index = -1;
            while (display.moveToNext()) {
                index++;
                assert.strictEqual(index, display.getCurrentPosition());
            }
            assert.strictEqual(items.length - 1, display.getCurrentPosition());

            while (display.moveToPrevious()) {
                index--;
                assert.strictEqual(index, display.getCurrentPosition());
            }
            assert.strictEqual(0, display.getCurrentPosition());
        });
    });

    describe('.setCurrentPosition()', () => {
        it('should change the position', () => {
            display.setCurrentPosition(0);
            assert.strictEqual(0, display.getCurrentPosition());

            display.setCurrentPosition(4);
            assert.strictEqual(4, display.getCurrentPosition());

            display.setCurrentPosition(-1);
            assert.strictEqual(-1, display.getCurrentPosition());
        });

        it('should change current item', () => {
            for (let i = 0; i < items.length; i++) {
                display.setCurrentPosition(i);
                assert.strictEqual(items[i], display.getCurrent().getContents());
            }
        });

        it('should throw an error on invalid index', () => {
            assert.throws(() => {
                display.setCurrentPosition(-2);
            });
            assert.throws(() => {
                display.setCurrentPosition(items.length);
            });
        });

        it('should trigger "onCurrentChange" with valid arguments', (done) => {
            let andDone = false;
            let position;
            const handler = (event, newCurrent, oldCurrent, newPosition, oldPosition) => {
                try {
                    assert.strictEqual(newPosition, position, 'Invalid newPosition');
                    assert.strictEqual(oldPosition, prevPosition, 'Invalid oldPosition');
                    assert.strictEqual(oldCurrent, prevCurrent, 'Invalid oldCurrent');
                    if (andDone) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            };
            display.subscribe('onCurrentChange', handler);

            let prevPosition;
            let prevCurrent;
            for (let step = 1; step < 4; step++) {
                prevPosition = display.getCurrentPosition();
                prevCurrent = display.getCurrent();
                for (position = 0; position < items.length; position += step) {
                    andDone = step === 3 && position + step >= items.length;

                    display.setCurrentPosition(position);
                    prevPosition = position;
                    prevCurrent = display.getCurrent();
                }
            }

            display.unsubscribe('onCurrentChange', handler);
        });

        it('should trigger just one secondary "onCurrentChange" event if cause a queue', () => {
            const given = [];
            let position = 0;
            const max = display.getCount() - 1;
            const handler = (event, newCurrent, oldCurrent, newPosition, oldPosition) => {
                given.push({
                    newCurrent,
                    oldCurrent,
                    newPosition,
                    oldPosition
                });
                while (position < max) {
                    display.setCurrentPosition(++position);
                }
            };

            display.subscribe('onCurrentChange', handler);
            display.setCurrentPosition(position);
            display.unsubscribe('onCurrentChange', handler);

            assert.equal(given.length, 2);
            assert.equal(given[0].newPosition, 0);
            assert.equal(given[1].newPosition, max);
        });
    });

    describe('.moveToNext()', () => {
        it('should change the current and the position', () => {
            let position = -1;
            while (display.moveToNext()) {
                position++;
                assert.strictEqual(position, display.getCurrentPosition());
                assert.strictEqual(items[position], display.getCurrent().getContents());
            }
        });

        it('should trigger "onCurrentChange" with valid arguments', (done) => {
            let andDone = false;
            const handler = (event, newCurrent, oldCurrent, newPosition, oldPosition) => {
                try {
                    assert.strictEqual(newPosition, oldPosition + 1, 'Invalid newPosition');
                    if (oldCurrent) {
                        assert.strictEqual(oldCurrent.getContents(), items[oldPosition], 'Invalid oldCurrent');
                    }

                    if (andDone) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            };
            display.subscribe('onCurrentChange', handler);

            let position = -1;
            while (display.moveToNext()) {
                position++;
                andDone = position === items.length - 2;
            }

            display.unsubscribe('onCurrentChange', handler);
        });
    });

    describe('.moveToPrevious()', () => {
        it('should change the current and the position', () => {
            let position = items.length - 1;
            display.setCurrentPosition(position);
            while (display.moveToPrevious()) {
                position--;
                assert.strictEqual(position, display.getCurrentPosition());
                assert.strictEqual(items[position], display.getCurrent().getContents());
            }
        });

        it('should trigger "onCurrentChange" with valid arguments', (done) => {
            let andDone = false;
            const handler = (event, newCurrent, oldCurrent, newPosition, oldPosition) => {
                try {
                    assert.strictEqual(newPosition, oldPosition - 1, 'Invalid newPosition');
                    if (oldCurrent) {
                        assert.strictEqual(oldCurrent.getContents(), items[oldPosition], 'Invalid oldCurrent');
                    }
                    if (andDone) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            };

            let position = items.length - 1;
            display.setCurrentPosition(position);

            display.subscribe('onCurrentChange', handler);

            while (display.moveToPrevious()) {
                position--;
                andDone = position === 1;
            }

            display.unsubscribe('onCurrentChange', handler);
        });
    });

    describe('.getSelectedItems()', () => {
        it('should return one selected item', () => {
            display.at(0).setSelected(true);
            const items = display.getSelectedItems();
            assert.strictEqual(items[0], display.at(0));
            assert.strictEqual(items.length, 1);
        });

        it('should return two selected items', () => {
            display.at(0).setSelected(true);
            display.at(1).setSelected(true);
            const items = display.getSelectedItems();
            for (let i = 0; i < items.length; i++) {
                assert.notEqual(display.getIndex(items[i]), -1);
            }
            assert.strictEqual(items.length, 2);
        });
    });

    describe('.setSelectedItemsAll()', () => {
        it('should set true for all item', () => {
            display.setSelectedItemsAll(true);
            display.each((item) => {
                assert.strictEqual(item.isSelected(), true);
            });
        });

        it('should set false for all item', () => {
            display.setSelectedItemsAll(false);
            display.each((item) => {
                assert.strictEqual(item.isSelected(), false);
            });
        });

        it('should selected a filtered item', () => {
            display.setFilter(() => {
                return false;
            });
            display.setSelectedItemsAll(true);
            display.setFilter(() => {
                return true;
            });
            display.each((item) => {
                assert.strictEqual(item.isSelected(), true);
            });
        });

        it('should fired the one event onchange', () => {
            let i = 0;
            display.subscribe('onCollectionChange', () => {
                i++;
            });
            display.setSelectedItemsAll(true);
            assert.strictEqual(i, 1);
        });
    });

    describe('.setSelectedItems()', () => {
        it('should selected was given items', () => {
            display.setSelectedItems(
                [list.at(0), list.at(1)],
                true
            );
            const selected = [
                display.getItemBySourceItem(list.at(0)),
                display.getItemBySourceItem(list.at(1))
            ];
            display.each((item) => {
                if (selected.indexOf(item) !== -1) {
                    assert.isTrue(item.isSelected());
                } else {
                    assert.isFalse(item.isSelected());
                }
            });
        });

        it('should deselect was given items', () => {
            display.setSelectedItemsAll(true);
            display.setSelectedItems(
                [list.at(0), list.at(1)],
                false
            );
            const deselect = [
                display.getItemBySourceItem(list.at(0)),
                display.getItemBySourceItem(list.at(1))
            ];
            display.each((item) => {
                if (deselect.indexOf(item) !== -1) {
                    assert.isFalse(item.isSelected());
                } else {
                    assert.isTrue(item.isSelected());
                }
            });
        });
    });

    describe('.invertSelectedItemsAll()', () => {
        it('should invert selection', () => {
            display.at(0).setSelected(true);
            display.at(1).setSelected(false);
            display.at(2).setSelected(true);
            display.invertSelectedItemsAll();
            assert.strictEqual(display.at(0).isSelected(), false);
            assert.strictEqual(display.at(1).isSelected(), true);
            assert.strictEqual(display.at(2).isSelected(), false);
        });

        it('should invert selection for a filtered items', () => {
            display.setFilter(() => {
                return false;
            });
            display.invertSelectedItemsAll();
            display.setFilter(() => {
                return true;
            });
            display.each((item) => {
                assert.strictEqual(item.isSelected(), true);
            });
        });
    });

    describe('.subscribe()', () => {
        const outsideItems = [1, 3];
        const getItems = () => [1, 2, 3, 4];
        const sort = (a, b) => b.collectionItem - a.collectionItem;
        const filter = (item) => outsideItems.indexOf(item) === -1;
        const getCollectionChangeHandler = (given, itemsMapper?) => (
            event, action, newItems, newItemsIndex, oldItems, oldItemsIndex
        ) => {
            given.push({
                action,
                newItems: itemsMapper ? newItems.map(itemsMapper) : newItems,
                newItemsIndex,
                oldItems: itemsMapper ? oldItems.map(itemsMapper) : oldItems,
                oldItemsIndex
            });
        };
        const handleGiven = (given, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
            given.push({
                action,
                newItems,
                newItemsIndex,
                oldItems,
                oldItemsIndex
            });
        };
        const checkGivenAndExpected = (given, expected) => {
            assert.equal(expected.length, given.length);

            for (let i = 0; i < given.length; i++) {
                assert.strictEqual(given[i].action, expected[i].action, 'at change #' + i);

                assert.strictEqual(given[i].newItems.length, expected[i].newItems.length, 'at change #' + i);
                assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex, 'at change #' + i);
                for (let j = 0; j < given[i].newItems.length; j++) {
                    assert.strictEqual(given[i].newItems[j].getContents(), expected[i].newItems[j], 'at change #' + i);
                }

                assert.strictEqual(given[i].oldItems.length, expected[i].oldItems.length, 'at change #' + i);
                assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex, 'at change #' + i);
                for (let j = 0; j < given[i].oldItems.length; j++) {
                    assert.strictEqual(given[i].oldItems[j].getContents(), expected[i].oldItems[j], 'at change #' + i);
                }
            }
        };

        context('when change a collection', () => {
            const itemsOld = getItems();
            const itemsNew = [9, 8, 7];
            // TODO Usually a reset event is fired on assign, however we've
            // disabled it in favour of the complete recreation of the collection.
            // Decide if this test is still applicable.
            const cases = [
                // {
                //     method: 'assign',
                //     action: IBindCollection.ACTION_RESET,
                //     newAt: 0,
                //     newItems: itemsNew,
                //     oldAt: 0,
                //     oldItems: itemsOld
                // },
                {
                    method: 'append',
                    action: IBindCollection.ACTION_ADD,
                    newAt: 4,
                    newItems: itemsNew,
                    oldAt: 0,
                    oldItems: []
                },
                {
                    method: 'prepend',
                    action: IBindCollection.ACTION_ADD,
                    newAt: 0,
                    newItems: itemsNew,
                    oldAt: 0,
                    oldItems: []
                },
                // {
                //     method: 'clear',
                //     action: IBindCollection.ACTION_RESET,
                //     newAt: 0,
                //     newItems: [],
                //     oldAt: 0,
                //     oldItems: itemsOld
                // }
            ];

            while (cases.length) {
                ((theCase) => {
                    it(`should fire "onCollectionChange" on ${theCase.method}`, () => {
                        const given: any[] = [];
                        const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                            given.push({
                                action,
                                newItems,
                                newItemsIndex,
                                oldItems,
                                oldItemsIndex
                            });
                        };
                        const list = new ObservableList({
                            items: itemsOld.slice()
                        });
                        const display = new CollectionDisplay({
                            collection: list
                        });

                        display.subscribe('onCollectionChange', handler);
                        display.getCollection()[theCase.method](itemsNew);
                        display.unsubscribe('onCollectionChange', handler);

                        assert.strictEqual(given.length, 1, 'Invalid actions count');

                        const firstGiven = given[0];
                        assert.strictEqual(firstGiven.action, theCase.action, 'Invalid action');

                        assert.strictEqual(
                            firstGiven.newItems.length,
                            theCase.newItems.length,
                            'Invalid newItems length'
                        );
                        for (let i = 0; i < theCase.newItems.length; i++) {
                            assert.strictEqual(
                                firstGiven.newItems[i].getContents(),
                                theCase.newItems[i],
                                `Invalid newItems[${i}]`
                            );
                        }
                        assert.strictEqual(firstGiven.newItemsIndex, theCase.newAt, 'Invalid newItemsIndex');

                        assert.strictEqual(
                            firstGiven.oldItems.length,
                            theCase.oldItems.length,
                            'Invalid oldItems length'
                        );
                        for (let i = 0; i < theCase.oldItems.length; i++) {
                            assert.strictEqual(
                                firstGiven.oldItems[i].getContents(),
                                theCase.oldItems[i],
                                `Invalid oldItems[${i}]`
                            );
                        }
                        assert.strictEqual(firstGiven.oldItemsIndex, theCase.oldAt, 'Invalid oldItemsIndex');
                    });

                    it('should fire "onBeforeCollectionChange" then "onCollectionChange" and then' +
                        `"onAfterCollectionChange" on ${theCase.method}`, () => {
                        const expected = ['before', 'on', 'after'];
                        const given = [];
                        const handlerBefore = () => {
                            given.push('before');
                        };
                        const handlerOn = () => {
                            given.push('on');
                        };
                        const handlerAfter = () => {
                            given.push('after');
                        };
                        const list = new ObservableList({
                            items: itemsOld.slice()
                        });
                        const display = new CollectionDisplay({
                            collection: list
                        });

                        display.subscribe('onBeforeCollectionChange', handlerBefore);
                        display.subscribe('onCollectionChange', handlerOn);
                        display.subscribe('onAfterCollectionChange', handlerAfter);

                        display.getCollection()[theCase.method](itemsNew);

                        display.unsubscribe('onBeforeCollectionChange', handlerBefore);
                        display.unsubscribe('onCollectionChange', handlerOn);
                        display.unsubscribe('onAfterCollectionChange', handlerAfter);

                        assert.deepEqual(given, expected);
                    });
                })(cases.shift());
            }
        });

        it('should fire "onCollectionChange" after add an item', (done) => {
            const items = getItems();
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                try {
                    assert.strictEqual(action, IBindCollection.ACTION_ADD, 'Invalid action');
                    assert.strictEqual(newItems[0].getContents(), 5, 'Invalid newItems');
                    assert.strictEqual(newItemsIndex, items.length - 1, 'Invalid newItemsIndex');
                    assert.strictEqual(oldItems.length, 0, 'Invalid oldItems');
                    assert.strictEqual(oldItemsIndex, 0, 'Invalid oldItemsIndex');
                    done();
                } catch (err) {
                    done(err);
                }
            };

            display.subscribe('onCollectionChange', handler);
            list.add(5);
            display.unsubscribe('onCollectionChange', handler);
        });

        it('should fire "onCollectionChange" after add an item if filter uses display index', () => {
            const items = getItems();
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list,
                filter: (item, index, collectionItem, collectionIndex) => collectionIndex < 3
            });
            const expected = [
                [IBindCollection.ACTION_REMOVE, [], 0, [3], 2],
                [IBindCollection.ACTION_ADD, [999], 1, [], 0]
            ];
            const given = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push([
                    action,
                    newItems.map((item) => item.getContents()),
                    newItemsIndex,
                    oldItems.map((item) => item.getContents()),
                    oldItemsIndex
                ]);
            };

            display.subscribe('onCollectionChange', handler);
            list.add(999, 1);
            display.unsubscribe('onCollectionChange', handler);

            assert.deepEqual(given, expected);
        });

        it('should fire "onCollectionChange" after remove an item', (done) => {
            const items = getItems();
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                try {
                    assert.strictEqual(action, IBindCollection.ACTION_REMOVE, 'Invalid action');
                    assert.strictEqual(newItems.length, 0, 'Invalid newItems');
                    assert.strictEqual(newItemsIndex, 0, 'Invalid newItemsIndex');
                    assert.strictEqual(oldItems[0].getContents(), 2, 'Invalid oldItems');
                    assert.strictEqual(oldItemsIndex, 1, 'Invalid oldItemsIndex');
                    done();
                } catch (err) {
                    done(err);
                }
            };

            display.subscribe('onCollectionChange', handler);
            list.remove(2);
            display.unsubscribe('onCollectionChange', handler);
        });

        it('should fire "onCollectionChange" after remove an item if filter uses display index', () => {
            const items = getItems();
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list,
                filter: (item, index, collectionItem, collectionIndex) => collectionIndex < 3
            });
            const expected = [
                [IBindCollection.ACTION_REMOVE, [], 0, [2], 1],
                [IBindCollection.ACTION_ADD, [4], 2, [], 0]
            ];
            const given = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push([
                    action,
                    newItems.map((item) => item.getContents()),
                    newItemsIndex,
                    oldItems.map((item) => item.getContents()),
                    oldItemsIndex
                ]);
            };

            display.subscribe('onCollectionChange', handler);
            list.removeAt(1);
            display.unsubscribe('onCollectionChange', handler);

            assert.deepEqual(given, expected);
        });

        it('should fire "onCollectionChange" after replace an item', () => {
            const items = getItems();
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const given = [];
            const expected = [{
                action: IBindCollection.ACTION_REMOVE,
                newItems: [],
                newItemsIndex: 0,
                oldItems: [3],
                oldItemsIndex: 2
            }, {
                action: IBindCollection.ACTION_ADD,
                newItems: [33],
                newItemsIndex: 2,
                oldItems: [],
                oldItemsIndex: 0
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
            };

            display.subscribe('onCollectionChange', handler);
            list.replace(33, 2);
            display.unsubscribe('onCollectionChange', handler);

            checkGivenAndExpected(given, expected);
        });

        it('should fire "onCollectionChange" after move an item forward', () => {
            const items = [1, 2, 3, 4];
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const moveFrom = 1;
            const moveTo = 2;
            const expected = [{
                action: IBindCollection.ACTION_MOVE,
                newItems: [items[moveTo]],
                newItemsIndex: moveFrom,
                oldItems: [items[moveTo]],
                oldItemsIndex: moveTo
            }];
            const given = [];
            const handler = getCollectionChangeHandler(given, (item) => item.getContents());

            display.subscribe('onCollectionChange', handler);
            list.move(moveFrom, moveTo);
            display.unsubscribe('onCollectionChange', handler);

            assert.deepEqual(given, expected);
        });

        it('should fire "onCollectionChange" after move an item backward', () => {
            const items = [1, 2, 3, 4];
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const moveFrom = 2;
            const moveTo = 1;
            const expected = [{
                action: IBindCollection.ACTION_MOVE,
                newItems: [items[moveFrom]],
                newItemsIndex: moveTo,
                oldItems: [items[moveFrom]],
                oldItemsIndex: moveFrom
            }];
            const given = [];
            const handler = getCollectionChangeHandler(given, (item) => item.getContents());

            display.subscribe('onCollectionChange', handler);
            list.move(moveFrom, moveTo);
            display.unsubscribe('onCollectionChange', handler);

            assert.deepEqual(given, expected);
        });

        it('should fire "onCollectionChange" after change wreezed item with grouping', () => {
            const items = [
                {id: 1},
                {id: 2}
            ];
            const list = new RecordSet({
                rawData: items
            });
            const display = new CollectionDisplay({
                collection: list,
                group: () => {
                    return 'group';
                }
            });
            const changedItem = list.at(0);
            const given = [];
            const expected = [{
                action: IBindCollection.ACTION_CHANGE,
                newItems: [changedItem],
                newItemsIndex: 1,
                oldItems: [changedItem],
                oldItemsIndex: 1
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
            };

            list.setEventRaising(false, true);
            changedItem.set('id', 'foo');
            display.subscribe('onCollectionChange', handler);
            list.setEventRaising(true, true);
            display.unsubscribe('onCollectionChange', handler);

            checkGivenAndExpected(given, expected);
        });

        it('should fire "onCollectionChange" after sort the display', () => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const given = [];
            const expected = [{
                action: IBindCollection.ACTION_MOVE, // 4, 1, 2, 3
                newItems: [4],
                newItemsIndex: 0,
                oldItems: [4],
                oldItemsIndex: 3
            }, {
                action: IBindCollection.ACTION_MOVE, // 4, 3, 1, 2
                newItems: [3],
                newItemsIndex: 1,
                oldItems: [3],
                oldItemsIndex: 3
            }, {
                action: IBindCollection.ACTION_MOVE, // 4, 3, 2, 1
                newItems: [2],
                newItemsIndex: 2,
                oldItems: [2],
                oldItemsIndex: 3
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
            };

            display.subscribe('onCollectionChange', handler);
            display.setSort(sort); // 1, 2, 3, 4 -> 4, 3, 2, 1
            display.unsubscribe('onCollectionChange', handler);

            checkGivenAndExpected(given, expected);
        });

        it('should fire "onCollectionChange" after sort the display if items moved forward', () => {
            const list = new ObservableList({
                items: [1, 2, 4, 5, 6, 3, 7, 8, 9, 10]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const given = [];
            const expected = [{
                action: IBindCollection.ACTION_MOVE,
                newItems: [3],
                newItemsIndex: 2,
                oldItems: [3],
                oldItemsIndex: 5
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
            };

            display.subscribe('onCollectionChange', handler);
            // 1, 2, 4, 5, 6, 3, 7, 8, 9, 10 -> 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            display.setSort((a, b) => a.collectionItem - b.collectionItem);
            display.unsubscribe('onCollectionChange', handler);

            checkGivenAndExpected(given, expected);
        });

        it('should fire "onCollectionChange" after filter the display', (done) => {
            const list = new ObservableList({
                items: getItems()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const firesToBeDone = 1;
            let fireId = 0;
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                try {
                    assert.strictEqual(action, IBindCollection.ACTION_REMOVE, 'Invalid action');
                    assert.strictEqual(newItems.length, 0, 'Invalid newItems');
                    assert.strictEqual(newItemsIndex, 0, 'Invalid newItemsIndex');
                    assert.notEqual(outsideItems.indexOf(oldItems[0].getContents()), -1, 'Invalid oldItems');
                    assert.strictEqual(oldItemsIndex, fireId, 'Invalid oldItemsIndex');
                    if (fireId === firesToBeDone) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
                fireId++;
            };

            display.subscribe('onCollectionChange', handler);
            display.setFilter(filter);
            display.unsubscribe('onCollectionChange', handler);
        });

        it('should fire "onCollectionChange" with move after group the display', () => {
            const list = new ObservableList({
                items: [
                    {id: 1, group: 1},
                    {id: 2, group: 2},
                    {id: 3, group: 1},
                    {id: 4, group: 2}
                ]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const given = [];
            const expected = [{
                action: IBindCollection.ACTION_ADD,
                newItems: [1],
                newItemsIndex: 0,
                oldItems: [],
                oldItemsIndex: 0
            }, {
                action: IBindCollection.ACTION_ADD,
                newItems: [2],
                newItemsIndex: 3,
                oldItems: [],
                oldItemsIndex: 0
            }, {
                action: IBindCollection.ACTION_MOVE,
                newItems: [list.at(2)],
                newItemsIndex: 2,
                oldItems: [list.at(2)],
                oldItemsIndex: 4
            }, {
                action: IBindCollection.ACTION_MOVE,
                newItems: [2],
                newItemsIndex: 3,
                oldItems: [2],
                oldItemsIndex: 4
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
            };

            display.subscribe('onCollectionChange', handler);
            display.setGroup((item) => item.group);
            display.unsubscribe('onCollectionChange', handler);

            // 1, 2, 3, 4 ->
            // (1), 1, 2, 3, 4 ->
            // (1), 1, 2, (2), 3, 4 ->
            // (1), 1, 3, 2, (2), 4 ->
            // (1), 1, 3, (2), 2, 4

            checkGivenAndExpected(given, expected);
        });

        it('should fire "onCollectionChange" split by groups after add an items', () => {
            const list = new ObservableList({
                items: [
                    {id: 1, group: 1},
                    {id: 2, group: 1},
                    {id: 3, group: 1},
                    {id: 4, group: 1}
                ]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const newItems = [
                {id: 5, group: 2},
                {id: 6, group: 1},
                {id: 7, group: 2},
                {id: 8, group: 3}
            ];
            const given = [];
            const expected = [{
                action: IBindCollection.ACTION_ADD,
                newItems: [newItems[1]],
                newItemsIndex: 5,
                oldItems: [],
                oldItemsIndex: 0
            }, {
                action: IBindCollection.ACTION_ADD,
                newItems: [2, newItems[0], newItems[2]],
                newItemsIndex: 6,
                oldItems: [],
                oldItemsIndex: 0
            }, {
                action: IBindCollection.ACTION_ADD,
                newItems: [3, newItems[3]],
                newItemsIndex: 9,
                oldItems: [],
                oldItemsIndex: 0
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
            };

            display.setGroup((item) => item.group);
            display.subscribe('onCollectionChange', handler);
            list.append(newItems);

            // (1), 1, 2, 3, 4 ->
            // (1), 1, 2, 3, 4, 6 ->
            // (1), 1, 2, 3, 4, 6, (2), 5, 7 ->
            // (1), 1, 2, 3, 4, 6, (2), 5, 7, (3), 8
            display.unsubscribe('onCollectionChange', handler);

            checkGivenAndExpected(given, expected);
        });

        it('should fire "onCollectionChange" split by groups after remove an items', () => {
            const list = new ObservableList({
                items: [
                    {id: 1, group: 1},
                    {id: 2, group: 1},
                    {id: 3, group: 2},
                    {id: 4, group: 2}
                ]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const given = [];
            const expected = [{
                action: IBindCollection.ACTION_REMOVE,
                newItems: [],
                newItemsIndex: 0,
                oldItems: [1, list.at(0), list.at(1)],
                oldItemsIndex: 0
            }, {
                action: IBindCollection.ACTION_REMOVE,
                newItems: [],
                newItemsIndex: 0,
                oldItems: [list.at(3)],
                oldItemsIndex: 2
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
            };

            display.setGroup((item) => {
                return item.group;
            });
            display.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);
            list.removeAt(3);
            list.removeAt(1);
            list.removeAt(0);
            list.setEventRaising(true, true);
            display.unsubscribe('onCollectionChange', handler);

            checkGivenAndExpected(given, expected);
        });

        it('should fire "onCollectionChange" with valid group after filter an items', () => {
            const list = new ObservableList({
                items: [
                    {id: 1, group: 1},
                    {id: 2, group: 1},
                    {id: 3, group: 2},
                    {id: 4, group: 2}
                ]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const given = [];
            const expected = [{
                action: IBindCollection.ACTION_REMOVE,
                newItems: [],
                newItemsIndex: 0,
                oldItems: [list.at(1)],
                oldItemsIndex: 2
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                handleGiven(given, action, newItems, newItemsIndex, oldItems, oldItemsIndex);
            };

            display.setGroup((item) => item.group);
            display.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);
            display.setFilter((item) => item.id !== 2);
            list.setEventRaising(true, true);
            display.unsubscribe('onCollectionChange', handler);

            checkGivenAndExpected(given, expected);
        });

        it('should fire "onCollectionChange" with valid item contents when work in events queue', () => {
            const getModel = (data) => new Model({
                    rawData: data
            });
            const list = new ObservableList({
                items: [
                    getModel({id: 1}),
                    getModel({id: 2}),
                    getModel({id: 3})
                ]
            });

            let updatedItem;
            let displayUpdatedItem;
            list.subscribe('onCollectionChange', () => {
                updatedItem = list.at(1);
                updatedItem.set('id', 'test');
            });

            const display = new CollectionDisplay({
                collection: list
            });

            display.subscribe('onCollectionChange', (e, action, newItems) => {
                if (newItems.length) {
                    displayUpdatedItem = newItems[0].getContents();
                }
            });

            list.removeAt(0);

            assert.strictEqual(updatedItem, displayUpdatedItem);
        });

        it(
            'should keep sequence "onBeforeCollectionChange, onCollectionChange, onAfterCollectionChange" unbreakable',
            () => {
            const expected = ['onList', 'before', 'on', 'after', 'before', 'on', 'after'];
            const list = new ObservableList();
            let display;
            const given = [];

            let filterAdded = false;
            const handlerOnList = () => {
                given.push('onList');
            };
            const handlerBefore = () => {
                given.push('before');
                if (!filterAdded) {
                    filterAdded = true;
                    display.setFilter(() => false);
                }
            };
            const handlerOn = () => {
                given.push('on');
            };
            const handlerAfter = () => {
                given.push('after');
            };

            list.subscribe('onCollectionChange', handlerOnList);

            display = new CollectionDisplay({
                collection: list
            });
            display.subscribe('onBeforeCollectionChange', handlerBefore);
            display.subscribe('onCollectionChange', handlerOn);
            display.subscribe('onAfterCollectionChange', handlerAfter);

            list.add('foo');

            list.unsubscribe('onCollectionChange', handlerOnList);
            display.unsubscribe('onBeforeCollectionChange', handlerBefore);
            display.unsubscribe('onCollectionChange', handlerOn);
            display.unsubscribe('onAfterCollectionChange', handlerAfter);

            assert.deepEqual(given, expected);
        });

        it('should fire "onCollectionChange" after setEventRaising if "analize" is true', () => {
            let fired = false;
            const args = {} as {
                action: string;
                newItems: Array<CollectionItem<IItem>>;
                newItemsIndex: number;
                oldItems: Array<CollectionItem<IItem>>;
                oldItemsIndex: number;
            };
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                fired = true;
                args.action = action;
                args.newItems = newItems;
                args.newItemsIndex = newItemsIndex;
                args.oldItems = oldItems;
                args.oldItemsIndex = oldItemsIndex;
            };

            display.subscribe('onCollectionChange', handler);
            display.setEventRaising(false, true);
            list.add({id: 999});

            assert.isFalse(fired);

            display.setEventRaising(true, true);
            display.unsubscribe('onCollectionChange', handler);

            assert.isTrue(fired);
            assert.strictEqual(args.action, IBindCollection.ACTION_ADD);
            assert.strictEqual(args.newItems[0].getContents().id, 999);
            assert.strictEqual(args.newItemsIndex, list.getCount() - 1);
            assert.strictEqual(args.oldItems.length, 0);
            assert.strictEqual(args.oldItemsIndex, 0);
        });

        it('should fire "onCollectionChange" after setEventRaising if items was moved', () => {
            const expected = [{
                action: IBindCollection.ACTION_REMOVE,
                newItems: [],
                oldItems: [list.at(0)]
            }, {
                action: IBindCollection.ACTION_ADD,
                newItems: [list.at(0)],
                oldItems: []
            }];
            const given = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems: newItems.map((item) => item.getContents()),
                    newItemsIndex,
                    oldItems: oldItems.map((item) => item.getContents()),
                    oldItemsIndex
                });
            };

            display.subscribe('onCollectionChange', handler);
            display.setEventRaising(false, true);

            const item = list.at(0);
            list.removeAt(0);
            list.add(item);

            display.setEventRaising(true, true);
            display.unsubscribe('onCollectionChange', handler);

            assert.strictEqual(given.length, expected.length);
            for (let i = 0; i < given.length; i++) {
                assert.strictEqual(given[i].action, expected[i].action);
                assert.deepEqual(given[i].newItems, expected[i].newItems);
                assert.deepEqual(given[i].oldItems, expected[i].oldItems);
            }
        });

        it('should fire "onCollectionChange" with valid item contents when the display and the collection are not ' +
            'synchronized', () => {
            const getModel = (data) => new Model({rawData: data});
            const items = [
                getModel({id: 'one'}),
                getModel({id: 'two'}),
                getModel({id: 'three'})
            ];
            const list = new ObservableList({
                items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            let expectItem;
            let givenItem;
            let expectIndex;
            let givenIndex;

            display.subscribe('onCollectionChange', (e, action, newItems, newItemsIndex) => {
                if (action === IBindCollection.ACTION_CHANGE) {
                    givenItem = newItems[0].getContents();
                    givenIndex = newItemsIndex;
                }
            });

            const handler = (event, action) => {
                if (action === IBindCollection.ACTION_REMOVE) {
                    expectIndex = 1;
                    expectItem = list.at(expectIndex);
                    expectItem.set('id', 'foo');
                }
            };
            list.setEventRaising(false, true);
            list.subscribe('onCollectionChange', handler);
            list.removeAt(0);
            list.add(getModel({id: 'bar'}), 1);
            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            assert.isDefined(expectItem);
            assert.strictEqual(givenItem, expectItem);
            assert.strictEqual(givenIndex, expectIndex);
        });

        it('should fire "onBeforeCollectionChange" and "onAfterCollectionChange" around each change when the display ' +
            'and the collection are not synchronized', () => {
            const list = new RecordSet({
                rawData: [{id: 1}, {id: 2}, {id: 3}, {id: 4}]
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = [
                'before', IBindCollection.ACTION_REMOVE, 'after',
                'before', IBindCollection.ACTION_CHANGE, 'after',
                'before', IBindCollection.ACTION_CHANGE, 'after'
            ];
            const given = [];
            const handlerBefore = () => {
                given.push('before');
            };
            const handlerAfter = () => {
                given.push('after');
            };
            const handlerOn = (event, action) => {
                given.push(action);
            };
            const handlerOnList = (event, action) => {
                if (action === IBindCollection.ACTION_REMOVE) {
                    list.at(0).set('id', 'foo');
                    list.at(1).set('id', 'bar');
                }
            };

            display.subscribe('onBeforeCollectionChange', handlerBefore);
            display.subscribe('onCollectionChange', handlerOn);
            display.subscribe('onAfterCollectionChange', handlerAfter);
            list.subscribe('onCollectionChange', handlerOnList);

            list.setEventRaising(false, true);
            list.removeAt(3);
            list.setEventRaising(true, true);

            display.unsubscribe('onBeforeCollectionChange', handlerBefore);
            display.unsubscribe('onCollectionChange', handlerOn);
            display.unsubscribe('onAfterCollectionChange', handlerAfter);
            list.unsubscribe('onCollectionChange', handlerOnList);

            assert.deepEqual(given, expected);
        });

        it('should trigger "onCollectionChange" with ACTION_CHANGE if source collection item changed while frozen',
        () => {
            const list = new RecordSet({
                rawData: items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = [{
                action: IBindCollection.ACTION_CHANGE,
                newItems: [list.at(2)],
                newItemsIndex: 2,
                oldItems: [list.at(2)],
                oldItemsIndex: 2
            }];
            const given = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex
                });
            };

            list.setEventRaising(false, true);
            list.at(2).set('name', 'foo');
            display.subscribe('onCollectionChange', handler);
            list.setEventRaising(true, true);
            display.unsubscribe('onCollectionChange', handler);

            assert.equal(given.length, expected.length);
            for (let i = 0; i < given.length; i++) {
                assert.strictEqual(given[i].action, expected[i].action, `at change #${i}`);

                assert.strictEqual(given[i].newItems.length, expected[i].newItems.length, `at change #${i}`);
                assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex, `at change #${i}`);
                for (let j = 0; j < given[i].newItems.length; j++) {
                    assert.strictEqual(given[i].newItems[j].getContents(), expected[i].newItems[j], `at change #${i}`);
                }

                assert.strictEqual(given[i].oldItems.length, expected[i].oldItems.length, `at change #${i}`);
                assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex, `at change #${i}`);
                for (let j = 0; j < given[i].oldItems.length; j++) {
                    assert.strictEqual(given[i].oldItems[j].getContents(), expected[i].oldItems[j], `at change #${i}`);
                }
            }
        });

        it('should trigger "onCollectionChange" with ACTION_CHANGE if source collection items changed while frozen ' +
            'and display inverts the collection', () => {
            const list = new RecordSet({
                rawData: items
            });
            const max = list.getCount() - 1;
            const display = new CollectionDisplay({
                collection: list,
                sort: (a, b) => b.index - a.index
            });
            const expected = [{
                action: IBindCollection.ACTION_CHANGE,
                newItems: [list.at(1)],
                newItemsIndex: max - 1,
                oldItems: [list.at(1)],
                oldItemsIndex: max - 1
            }, {
                action: IBindCollection.ACTION_CHANGE,
                newItems: [list.at(4), list.at(3)],
                newItemsIndex: max - 4,
                oldItems: [list.at(4), list.at(3)],
                oldItemsIndex: max - 4
            }, {
                action: IBindCollection.ACTION_CHANGE,
                newItems: [list.at(6)],
                newItemsIndex: max - 6,
                oldItems: [list.at(6)],
                oldItemsIndex: max - 6
            }];
            const given = [];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex
                });
            };

            list.setEventRaising(false, true);
            list.at(1).set('name', 'fooA');
            list.at(3).set('name', 'fooB');
            list.at(4).set('name', 'fooC');
            list.at(6).set('name', 'fooD');
            display.subscribe('onCollectionChange', handler);
            list.setEventRaising(true, true);
            display.unsubscribe('onCollectionChange', handler);

            assert.equal(given.length, expected.length);
            for (let i = 0; i < given.length; i++) {
                assert.strictEqual(given[i].action, expected[i].action, `at change #${i}`);

                assert.strictEqual(given[i].newItems.length, expected[i].newItems.length, `at change #${i}`);
                assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex, `at change #${i}`);
                for (let j = 0; j < given[i].newItems.length; j++) {
                    assert.strictEqual(given[i].newItems[j].getContents(), expected[i].newItems[j], `at change #${i}`);
                }

                assert.strictEqual(given[i].oldItems.length, expected[i].oldItems.length, `at change #${i}`);
                assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex, `at change #${i}`);
                for (let j = 0; j < given[i].oldItems.length; j++) {
                    assert.strictEqual(given[i].oldItems[j].getContents(), expected[i].oldItems[j], `at change #${i}`);
                }
            }
        });

        it('should fire "onCollectionChange" after change an item', () => {
            const items = [{id: 1}, {id: 2}, {id: 3}];
            const list = new RecordSet({
                rawData: items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const given = [];
            const expected = [{
                items: [display.at(1)],
                index: 1
            }];
            const handler = (event, action, newItems, newItemsIndex) => {
                given.push({
                    items: newItems,
                    index: newItemsIndex
                });
            };

            display.subscribe('onCollectionChange', handler);
            list.at(1).set('id', 'bar');
            display.unsubscribe('onCollectionChange', handler);

            assert.strictEqual(given.length, expected.length);
            for (let i = 0; i < given.length; i++) {
                assert.deepEqual(given[i].items, expected[i].items);
                assert.strictEqual(given[i].index, expected[i].index);
            }
        });

        it('should fire "onCollectionChange" after change an item in group', () => {
            const items = [{id: 1, g: 1}, {id: 2, g: 1}, {id: 3, g: 2}];
            const list = new RecordSet({
                rawData: items
            });
            const display = new CollectionDisplay({
                collection: list,
                group: (item) => item.get('g')
            });
            const given = [];
            const expected = [{
                items: [display.at(2)],
                index: 2
            }];
            const handler = (event, action, newItems, newItemsIndex) => {
                given.push({
                    items: newItems,
                    index: newItemsIndex
                });
            };

            display.subscribe('onCollectionChange', handler);
            list.at(1).set('id', 'bar');
            display.unsubscribe('onCollectionChange', handler);

            assert.strictEqual(given.length, expected.length);
            for (let i = 0; i < given.length; i++) {
                assert.deepEqual(given[i].items, expected[i].items);
                assert.strictEqual(given[i].index, expected[i].index);
            }
        });

        it('should fire "onCollectionChange" after changed item is not moved as item only changed', () => {
            const items = [{id: 1}, {id: 3}, {id: 5}];
            const list = new RecordSet({
                rawData: items
            });
            const display = new CollectionDisplay({
                collection: list,
                keyProperty: 'id',
                sort: (a, b) => a.collectionItem.get('id') - b.collectionItem.get('id')
            });
            const given = [];
            const expected = [{
                action: IBindCollection.ACTION_CHANGE,
                newItems: [display.at(1)],
                newItemsIndex: 1,
                oldItems: [display.at(1)],
                oldItemsIndex: 1
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex
                });
            };

            display.subscribe('onCollectionChange', handler);
            list.at(1).set('id', 2);
            display.unsubscribe('onCollectionChange', handler);

            assert.strictEqual(given.length, expected.length);
            for (let i = 0; i < given.length; i++) {
                assert.deepEqual(given[i].action, expected[i].action);
                assert.deepEqual(given[i].newItems, expected[i].newItems);
                assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
            }
        });

        it('should fire "onCollectionChange" after changed item is moved down as it\'s sibling moved up and item ' +
            'changed', () => {
            const items = [{id: 1}, {id: 3}, {id: 5}];
            list = new RecordSet({
                rawData: items
            });
            const display = new CollectionDisplay({
                collection: list,
                keyProperty: 'id',
                sort: (a, b) => a.collectionItem.get('id') - b.collectionItem.get('id')
            });
            const given = [];
            const expected = [{
                action: IBindCollection.ACTION_MOVE,
                newItems: [display.at(1)],
                newItemsIndex: 0,
                oldItems: [display.at(1)],
                oldItemsIndex: 1
            }, {
                action: IBindCollection.ACTION_CHANGE,
                newItems: [display.at(0)],
                newItemsIndex: 1,
                oldItems: [display.at(0)],
                oldItemsIndex: 1
            }];
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex
                });
            };

            display.subscribe('onCollectionChange', handler);
            list.at(0).set('id', 4);
            display.unsubscribe('onCollectionChange', handler);

            assert.strictEqual(given.length, expected.length);
            for (let i = 0; i < given.length; i++) {
                assert.deepEqual(given[i].action, expected[i].action);
                assert.deepEqual(given[i].newItems, expected[i].newItems);
                assert.strictEqual(given[i].newItemsIndex, expected[i].newItemsIndex);
                assert.deepEqual(given[i].oldItems, expected[i].oldItems);
                assert.strictEqual(given[i].oldItemsIndex, expected[i].oldItemsIndex);
            }
        });

        it('should fire "onCollectionChange" after changed item is moved up as it\'s really moved up', () => {
            const items = [{id: 1}, {id: 3}, {id: 5}];
            const list = new RecordSet({
                rawData: items
            });
            const display = new CollectionDisplay({
                collection: list,
                keyProperty: 'id',
                sort: (a, b) => a.collectionItem.get('id') - b.collectionItem.get('id')
            });
            const expected = [{
                action: IBindCollection.ACTION_MOVE,
                newItems: [display.at(1)],
                newItemsIndex: 0,
                oldItems: [display.at(1)],
                oldItemsIndex: 1
            }];
            const given = [];
            const handler = getCollectionChangeHandler(given);

            display.subscribe('onCollectionChange', handler);
            list.at(1).set('id', 0);
            display.unsubscribe('onCollectionChange', handler);

            assert.deepEqual(given, expected);
        });

        it('should fire "onBeforeCollectionChange" then "onCollectionChange" and then "onAfterCollectionChange" ' +
            'after change an item', () => {
            const items = [{id: 1}, {id: 2}, {id: 3}];
            const list = new RecordSet({
                rawData: items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = ['before', 'on', 'after'];
            const given = [];
            const handlerBefore = () => {
                given.push('before');
            };
            const handlerOn = () => {
                given.push('on');
            };
            const handlerAfter = () => {
                given.push('after');
            };

            display.subscribe('onBeforeCollectionChange', handlerBefore);
            display.subscribe('onCollectionChange', handlerOn);
            display.subscribe('onAfterCollectionChange', handlerAfter);

            list.at(1).set('id', 'bar');

            display.unsubscribe('onBeforeCollectionChange', handlerBefore);
            display.unsubscribe('onCollectionChange', handlerOn);
            display.unsubscribe('onAfterCollectionChange', handlerAfter);

            assert.deepEqual(given, expected);
        });

        it('should fire "onBeforeCollectionChange" then "onCollectionChange" and then "onAfterCollectionChange" ' +
            'after change an item while frozen', () => {
            const items = [{id: 1}, {id: 2}, {id: 3}];
            const list = new RecordSet({
                rawData: items
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const expected = ['before', 'on', 'after'];
            const given = [];
            const handlerBefore = () => {
                given.push('before');
            };
            const handlerOn = () => {
                given.push('on');
            };
            const handlerAfter = () => {
                given.push('after');
            };

            display.subscribe('onBeforeCollectionChange', handlerBefore);
            display.subscribe('onCollectionChange', handlerOn);
            display.subscribe('onAfterCollectionChange', handlerAfter);

            list.setEventRaising(false, true);
            list.at(1).set('id', 'bar');
            list.setEventRaising(true, true);

            display.unsubscribe('onBeforeCollectionChange', handlerBefore);
            display.unsubscribe('onCollectionChange', handlerOn);
            display.unsubscribe('onAfterCollectionChange', handlerAfter);

            assert.deepEqual(given, expected);
        });

        it('should observe "onEventRaisingChange" with analize=false on the source collection and become actual ' +
            'on enable', () => {
            const list = new ObservableList({
                items: items.slice()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const at = 1;
            const listItem = list.at(at);
            const nextListItem = list.at(at + 1);
            const displayItem = display.at(at);
            const nextDisplayItem = display.at(at + 1);

            list.setEventRaising(false);
            list.removeAt(at);
            assert.strictEqual(display.at(at), displayItem);
            assert.strictEqual(display.at(at).getContents(), listItem);
            assert.strictEqual(display.at(at + 1), nextDisplayItem);
            assert.strictEqual(display.at(at + 1).getContents(), nextListItem);

            list.setEventRaising(true);
            assert.strictEqual(display.at(at).getContents(), nextListItem);
            assert.notEqual(display.at(at + 1).getContents(), nextListItem);
        });

        it('should observe "onEventRaisingChange" with analize=true on the source collection and become actual ' +
            'on enable', () => {
            const list = new ObservableList({
                items: items.slice()
            });
            const display = new CollectionDisplay({
                collection: list
            });
            const at = 1;
            const listItem = list.at(at);
            const nextListItem = list.at(at + 1);
            const displayItem = display.at(at);
            const nextDisplayItem = display.at(at + 1);

            list.setEventRaising(false, true);
            list.removeAt(at);
            assert.strictEqual(display.at(at), displayItem);
            assert.strictEqual(display.at(at).getContents(), listItem);
            assert.strictEqual(display.at(at + 1), nextDisplayItem);
            assert.strictEqual(display.at(at + 1).getContents(), nextListItem);

            list.setEventRaising(true, true);
            assert.strictEqual(display.at(at), nextDisplayItem);
            assert.strictEqual(display.at(at).getContents(), nextListItem);
            assert.notEqual(display.at(at + 1), nextDisplayItem);
            assert.notEqual(display.at(at + 1).getContents(), nextListItem);
        });

        it('should notify onCollectionChange after call setEventRaising if "analize" is true', () => {
            const item = {id: 999};
            const expected = [{
                action: IBindCollection.ACTION_ADD,
                newItems: [item],
                newItemsIndex: 7,
                oldItems: [],
                oldItemsIndex: 0
            }];
            const given = [];
            const handler = getCollectionChangeHandler(given, (item) => item.getContents());

            display.subscribe('onCollectionChange', handler);
            display.setEventRaising(false, true);
            list.add(item);

            assert.isTrue(given.length === 0);

            display.setEventRaising(true, true);
            display.unsubscribe('onCollectionChange', handler);

            assert.deepEqual(given, expected);
        });

        describe('should increase version if certain properties of source collection item change', () => {
            const propertiesOfInterest = [
                'editingContents',
                'animated',
                'canShowActions'
            ];
            propertiesOfInterest.forEach((property) => {
                it(property, () => {
                    const items = [{
                        id: 1,
                        editingContents: null,
                        animated: null,
                        canShowActions: null
                    }];
                    const list = new RecordSet({
                        rawData: items
                    });
                    const display = new CollectionDisplay({
                        collection: list
                    });
                    const prevVersion = display.getVersion();
                    list.at(0).set(property, true);
                    assert.isAbove(display.getVersion(), prevVersion);
                });
            });
        });
    });

    describe('::getDefaultDisplay()', () => {
        it('should return certain class instance for ObservableList', () => {
            const items = [
                {id: 0}
            ];
            const list = new ObservableList({
                items
            });
            const display = Display.getDefaultDisplay(list);

            assert.instanceOf(display, CollectionDisplay);
        });
    });

    describe('.toJSON()', () => {
        it('should serialize the collection', () => {
            display.setFilter(() => true);
            display.setGroup(() => 0);
            const json = display.toJSON();
            assert.strictEqual(json.module, 'Controls/display:Collection');
            assert.isNumber(json.id);
            assert.isTrue(json.id > 0);
            assert.deepEqual(json.state.$options, (display as any)._getOptions());
            assert.strictEqual(json.state.$options.filter, (display as any)._$filter);
            assert.strictEqual(json.state.$options.group, (display as any)._$group);
            assert.strictEqual(json.state.$options.sort, (display as any)._$sort);
            assert.deepEqual((json.state as any)._composer._result.items, display.getItems());
        });

        it('should clone the collection', () => {
            const serializer = new Serializer();
            const json = JSON.stringify(display, serializer.serialize);
            const clone = JSON.parse(json, serializer.deserialize);
            const items = display.getItems();
            const cloneItems = clone.getItems();

            for (let i = 0; i < items.length; i++) {
                assert.strictEqual(
                    clone.at(i),
                    cloneItems[i]
                );

                assert.strictEqual(
                    cloneItems[i].getInstanceId(),
                    items[i].getInstanceId()
                );

                assert.deepEqual(
                    cloneItems[i].getContents(),
                    items[i].getContents()
                );

                assert.strictEqual(
                    cloneItems[i].getOwner(),
                    clone
                );
            }
        });

        it('should keep relation between a collection item contents and the source collection', () => {
            const serializer = new Serializer();
            const json = JSON.stringify(display, serializer.serialize);
            const clone = JSON.parse(json, serializer.deserialize);
            clone.each((item) => {
                assert.notEqual(clone.getCollection().getIndex(item.getContents()), -1);
            });

        });
    });

    describe('::fromJSON()', () => {
        it('should keep items order if source collection has been affected', () => {
            const items = getItems();
            const list = new ObservableList({
                items
            });
            const strategy = new CollectionDisplay({
                collection: list,
                keyProperty: 'id'
            });
            const serializer = new Serializer();
            const json = JSON.stringify(strategy, serializer.serialize);
            const clone = JSON.parse(json, serializer.deserialize);
            const cloneItems = [];

            clone.getCollection().removeAt(0);
            clone.each((item) => {
                cloneItems.push(item.getContents());
            });

            assert.deepEqual(cloneItems, items.slice(1));
        });

        it('should restore items contents in all decorators', () => {
            const items = getItems();
            const list = new ObservableList({
                items
            });
            const strategy = new CollectionDisplay({
                collection: list,
                keyProperty: 'id'
            });
            const serializer = new Serializer();
            const json = JSON.stringify(strategy, serializer.serialize);
            const clone = JSON.parse(json, serializer.deserialize);
            let cloneDecorator = clone._composer.getResult();

            while (cloneDecorator) {
                cloneDecorator.items.forEach((item) => {
                    assert.isUndefined(item._contentsIndex);
                });
                cloneDecorator = cloneDecorator.source;
            }
        });
    });

    it('.getDisplayProperty()', () => {
        const displayProperty = 'displayProperty';
        const collection = new CollectionDisplay({
            collection: [],
            displayProperty
        });
        assert.strictEqual(collection.getDisplayProperty(), displayProperty);
    });

    it('.setMultiSelectVisibility()', () => {
        const multiSelectVisibility = 'multiSelectVisibility';
        const collection = new CollectionDisplay({
            collection: [],
            multiSelectVisibility
        });
        assert.strictEqual(
            collection.getMultiSelectVisibility(),
            multiSelectVisibility,
            `multiSelectVisibility should get initialized from options`
        );

        const prevVersion = collection.getVersion();
        collection.setMultiSelectVisibility('anotherVisibility');
        assert.strictEqual(
            collection.getMultiSelectVisibility(),
            'anotherVisibility',
            '.setMultiSelectVisibility() should change multiSelectVisibility'
        );
        assert.isAbove(
            collection.getVersion(),
            prevVersion,
            '.setMultiSelectVisibility() should increase collection version'
        )
    });

    it('.getRowSpacing()', () => {
        const rowSpacing = 'rowSpacing';
        const collection = new CollectionDisplay({
            collection: [],
            rowSpacing
        });
        assert.strictEqual(collection.getRowSpacing(), rowSpacing);
    });

    it('.getLeftSpacing()', () => {
        const leftSpacing = 'leftSpacing';
        const collection = new CollectionDisplay({
            collection: [],
            leftSpacing
        });
        assert.strictEqual(collection.getLeftSpacing(), leftSpacing);
    });

    it('.getRightSpacing()', () => {
        const rightSpacing = 'rightSpacing';
        const collection = new CollectionDisplay({
            collection: [],
            rightSpacing
        });
        assert.strictEqual(collection.getRightSpacing(), rightSpacing);
    });

    it('.setEditingConfig()', () => {
        const editingConfig = 'editingConfig';
        const collection = new CollectionDisplay({
            collection: [],
            editingConfig
        });

        const prevVersion = collection.getVersion();
        collection.setEditingConfig('anotherEditingConfig');
        assert.isAbove(
            collection.getVersion(),
            prevVersion,
            '.setEditingConfig() should increase collection version'
        )
    });

    it('.setSearchValue()', () => {
        const searchValue = 'searchValue';
        const collection = new CollectionDisplay({
            collection: []
        });
        collection.setSearchValue(searchValue);
        assert.strictEqual(collection.getSearchValue(), searchValue);
    });

    it('.getSearchValue()', () => {
        const searchValue = 'searchValue';
        const collection = new CollectionDisplay({
            collection: [],
            searchValue
        });
        assert.strictEqual(collection.getSearchValue(), searchValue);
    });

    it('.getItemBySourceKey()', () => {
        const list = new RecordSet({
            rawData: items,
            keyProperty: 'id'
        });
        const collection = new CollectionDisplay({
            collection: list,
            keyProperty: 'id'
        });
        const item = collection.getItemBySourceKey(1);
        assert.strictEqual(item.getContents().getId(), 1);
    });

    it('.getIndexByKey()', () => {
        const list = new RecordSet({
            rawData: items,
            keyProperty: 'id'
        });
        const collection = new CollectionDisplay({
            collection: list,
            keyProperty: 'id'
        });
        assert.strictEqual(
            collection.getIndexByKey(5),
            items.findIndex((item) => item.id === 5)
        );
    });

    it('.getFirstItem()', () => {
        assert.strictEqual(
            display.getFirstItem(),
            items[0]
        );
    });

    it('.getLastItem()', () => {
        assert.strictEqual(
            display.getLastItem(),
            items[items.length - 1]
        );
    });

    describe('version increases on collection change', () => {
        let rs: RecordSet;
        let display: CollectionDisplay<unknown>;

        beforeEach(() => {
            const items = [
                { id: 1, name: 'Ivan' },
                { id: 2, name: 'Alexey' },
                { id: 3, name: 'Olga' }
            ];
            rs = new RecordSet({
                rawData: items,
                keyProperty: 'id'
            });
            display = new CollectionDisplay({
                collection: rs
            });
        });

        it('collection reset', () => {
            const version = display.getVersion();

            rs.setEventRaising(false, true);
            while (rs.getCount() > 0) {
                rs.removeAt(0);
            }
            rs.add(new Record({
                rawData: {
                    id: 4,
                    name: 'Nataly'
                }
            }));
            rs.setEventRaising(true, true);

            assert.isAbove(display.getVersion(), version);
        });

        it('collection change', () => {
            const version = display.getVersion();
            rs.at(0).set('name', 'Dmitry');
            assert.isAbove(display.getVersion(), version);
        });

        it('collection add', () => {
            const version = display.getVersion();
            rs.add(
                new Record({
                    rawData: {
                        id: 4,
                        name: 'Vadim'
                    }
                })
            );
            assert.isAbove(display.getVersion(), version);
        });

        it('collection remove', () => {
            const version = display.getVersion();
            rs.removeAt(0);
            assert.isAbove(display.getVersion(), version);
        });

        it('collection replace', () => {
            const version = display.getVersion();
            rs.replace(new Record({
                rawData: {
                    id: 4,
                    name: 'Daniel'
                }
            }), 0);
            assert.isAbove(display.getVersion(), version);
        });

        it('collection move', () => {
            const version = display.getVersion();
            rs.move(1, 0);
            assert.isAbove(display.getVersion(), version);
        });
    });

    // TODO возможно, это уйдёт из Collection
    describe('setActiveItem(), getActiveItem()', () => {
        let rs: RecordSet;
        let display: CollectionDisplay<unknown>;

        beforeEach(() => {
            const items = [
                { id: 1, name: 'Ivan' },
                { id: 2, name: 'Alexey' },
                { id: 3, name: 'Olga' }
            ];
            rs = new RecordSet({
                rawData: items,
                keyProperty: 'id'
            });
            display = new CollectionDisplay({
                collection: rs
            });
        });

        it('deactivates old active item', () => {
            const testingItem = display.getItemBySourceKey(1);
            display.setActiveItem(display.getItemBySourceKey(1));
            display.setActiveItem(display.getItemBySourceKey(2));
            assert.isFalse(testingItem.isActive());
        });
        it('activates new active item', () => {
            const testingItem = display.getItemBySourceKey(2);
            display.setActiveItem(display.getItemBySourceKey(1));
            display.setActiveItem(display.getItemBySourceKey(2));
            assert.isTrue(testingItem.isActive());
        });
        it('correctly returns active item', () => {
            const testingItem = display.getItemBySourceKey(2);
            display.setActiveItem(display.getItemBySourceKey(2));
            assert.equal(display.getActiveItem(), testingItem);
        });
    });
});
