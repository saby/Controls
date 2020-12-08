import { assert } from 'chai';

import Group from 'Controls/_display/itemsStrategy/Group';
import IItemsStrategy from 'Controls/_display/IItemsStrategy';

import {
    GroupItem,
    CollectionItem,
    TreeItem
} from 'Controls/display';

describe('Controls/_display/itemsStrategy/Group', () => {
    function wrapItem<S, T = TreeItem<S>>(item: S): T {
        return new TreeItem<S>({
            contents: item
        }) as any as T;
    }

    function getSource<S, T = TreeItem<S>>(items: S[]): IItemsStrategy<S, T> {
        const wraps = items.map<T>(wrapItem);

        return {
            '[Controls/_display/IItemsStrategy]': true,
            source: null,
            options: {
                display: null
            },
            get count(): number {
                return wraps.length;
            },
            get items(): T[] {
                return wraps.slice();
            },
            at(index: number): T {
                return wraps[index];
            },
            getDisplayIndex(index: number): number {
                return index;
            },
            getCollectionIndex(index: number): number {
                return index;
            },
            splice(start: number, deleteCount: number, added?: S[]): T[] {
                items.splice(start, deleteCount, ...added);
                return wraps.splice(start, deleteCount, ...added.map<T>(wrapItem));
            },
            invalidate(): void {
                this.invalidated = true;
            },
            reset(): void {
                items.length = 0;
            }
        };
    }

    let items: string[];
    let source;
    let strategy;

    beforeEach(() => {
        items = ['one', 'two', 'three'];
        source = getSource(items);
        strategy = new Group({source});
    });

    afterEach(() => {
        items = undefined;
        source = undefined;
        strategy = undefined;
    });

    describe('.options', () => {
        it('should return the source options', () => {
            assert.strictEqual(strategy.options, source.options);
        });
    });

    describe('.at()', () => {
        it('should return item', () => {
            source.items.forEach((item, index) => {
                assert.strictEqual(strategy.at(index), item);
            });
        });

        it('should return group before item', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: () => {
                    return 'foo';
                }
            });
            const expected = [
                'foo',
                source.items[0].getContents(),
                source.items[1].getContents(),
                source.items[2].getContents()
            ];

            assert.instanceOf(strategy.at(0), GroupItem);
            expected.forEach((item, index) => {
                assert.strictEqual(strategy.at(index).getContents(), item);
            });
        });

        it('should throw an ReferenceError if index is out of bounds', () => {
            assert.throws(() => {
                strategy.at(-1);
            }, ReferenceError);

            assert.throws(() => {
                strategy.at(strategy.count);
            }, ReferenceError);
        });
    });

    describe('.count', () => {
        it('should return items count', () => {
            assert.strictEqual(strategy.count, source.items.length);
        });

        it('should return items count with groups', () => {
            const strategy = new Group<string>({
                source,
                groupConstructor: GroupItem,
                handler: (item) => item
            });
            assert.strictEqual(strategy.count, 2 * source.items.length);
        });
    });

    describe('.items', () => {
        it('should return source items', () => {
            assert.deepEqual(strategy.items, source.items);
        });

        it('should return items with groups', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            });
            const expected = [];

            source.items.forEach((item) => {
                expected.push('#' + item.getContents());
                expected.push(item.getContents());
            });

            assert.deepEqual(
                strategy.items.map((item) => item.getContents()),
                expected
            );
        });

        it('should place groups before their items', () => {
            const items = [
                {id: 'a', group: 'one'},
                {id: 'b', group: 'two'},
                {id: 'c', group: 'one'},
                {id: 'd', group: 'two'}
            ];
            const source = getSource(items);
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => item.group
            });
            const expected = [
                'one',
                items[0],
                items[2],
                'two',
                items[1],
                items[3]
            ];

            assert.deepEqual(
                strategy.items.map((item) => item.getContents()),
                expected
            );
        });

        it('should return items after group has gone', () => {
            const items = ['one', 'two', 'three'];
            const source = getSource(items);
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            });

            ['#one', 'one', '#two', 'two', '#three', 'three'].forEach((expect, index) => {
                assert.strictEqual(strategy.items[index].getContents(), expect);
            });

            source.splice(1, 1, ['four']);
            strategy.invalidate();

            ['#one', 'one', '#four', 'four', '#three', 'three'].forEach((expect, index) => {
                assert.strictEqual(strategy.items[index].getContents(), expect);
            });
        });
    });

    describe('.splice()', () => {
        it('should add items', () => {
            const items = [1, 2];
            const count = strategy.count;
            strategy.splice(0, 0, items);
            assert.strictEqual(strategy.count, items.length + count);
        });

        it('should add items before first group', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            });
            const newItems = ['four', 'five'];
            const expected = ['#four', 'four', '#five', 'five', '#one', 'one', '#two', 'two', '#three', 'three'];

            strategy.splice(0, 0, newItems);
            expected.forEach((expect, index) => {
                assert.strictEqual(strategy.at(index).getContents(), expect);
            });
            assert.strictEqual(strategy.count, expected.length);
        });

        it('should add items after first group', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            });
            const newItems = ['four', 'five'];
            const expected = ['#one', 'one', '#four', 'four', '#five', 'five', '#two', 'two', '#three', 'three'];

            strategy.splice(1, 0, newItems);
            expected.forEach((expect, index) => {
                assert.strictEqual(strategy.at(index).getContents(), expect);
            });
            assert.strictEqual(strategy.count, expected.length);
        });

        it('should add items after last group', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            });
            const newItems = ['four', 'five'];
            const expected = ['#one', 'one', '#two', 'two', '#three', 'three', '#four', 'four', '#five', 'five'];

            strategy.splice(items.length, 0, newItems);
            expected.forEach((expect, index) => {
                assert.strictEqual(strategy.at(index).getContents(), expect);
            });
            assert.strictEqual(strategy.count, expected.length);
        });

        it('should remove item and group', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            });
            const expected = ['#two', 'two', '#three', 'three'];

            strategy.splice(0, 1, []);
            expected.forEach((expect, index) => {
                assert.strictEqual(strategy.at(index).getContents(), expect);
            });
            assert.strictEqual(strategy.count, expected.length);
        });

        it('should remove item and keep group', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: () => '#foo'
            });
            const expected = ['#foo', 'two', 'three'];

            strategy.splice(0, 1, []);
            expected.forEach((expect, index) => {
                assert.strictEqual(strategy.at(index).getContents(), expect);
            });
            assert.strictEqual(strategy.count, expected.length);
        });
    });

    describe('.reset()', () => {
        it('should reset group items', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            });
            const oldItems = strategy.items;

            strategy.reset();
            const newItems = strategy.items;

            oldItems.forEach((item, index) => {
                if (item['[Controls/_display/GroupItem]']) {
                    assert.notEqual(newItems[index], oldItems[index]);
                    assert.equal(newItems[index].getContents(), oldItems[index].getContents());
                } else {
                    assert.strictEqual(newItems[index], oldItems[index]);
                }
            });
        });
    });

    describe('.getDisplayIndex()', () => {
        it('should return valid index', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            });

            source.items.forEach((item, index) => {
                assert.strictEqual(
                    strategy.getDisplayIndex(index),
                    1 + 2 * index
                );
            });
        });

        it('should return last index', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: () => 'foo'
            });

            assert.strictEqual(
                strategy.getDisplayIndex(strategy.count),
                strategy.count
            );
        });

        it('should return valid index after group has gone', () => {
            const items = ['one', 'two', 'three'];
            const source = getSource(items);
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            });

            [1, 3, 5].forEach((expect, index) => {
                assert.strictEqual(strategy.getDisplayIndex(index), expect);
            });

            source.splice(1, 1, ['four']);
            strategy.invalidate();

            [1, 3, 5].forEach((expect, index) => {
                assert.strictEqual(strategy.getDisplayIndex(index), expect);
            });
        });
    });

    describe('.getCollectionIndex()', () => {
        it('should return valid index', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            });

            strategy.items.forEach((item, index) => {
                assert.strictEqual(
                    strategy.getCollectionIndex(index),
                    index % 2 ? (index - 1) / 2 : -1
                );
            });
        });

        it('should return -1 if index out of bounds', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: () => 'foo'
            });

            assert.strictEqual(
                strategy.getCollectionIndex(strategy.count),
                -1
            );
        });

        it('should return valid index after group has gone', () => {
            const items = ['one', 'two', 'three'];
            const source = getSource(items);
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            });

            [-1, 0, -1, 1, -1, 2].forEach((expect, index) => {
                assert.strictEqual(strategy.getCollectionIndex(index), expect);
            });

            source.splice(1, 1, ['four']);
            strategy.invalidate();

            [-1, 0, -1, 1, -1, 2].forEach((expect, index) => {
                assert.strictEqual(strategy.getCollectionIndex(index), expect);
            });
        });
    });

    describe('::sortItems', () => {
        it('should return original items order if handler is not presented', () => {
            const items = [new CollectionItem(), new CollectionItem(), new CollectionItem()];
            const groups = [new GroupItem()];
            const options: any = {
                display: {},
                groups,
                groupConstructor: GroupItem,
                handler: null
            };
            const expected = [0, 1, 2];
            const given = Group.sortItems(items, options);

            assert.deepEqual(given, expected);
        });

        it('should create single group', () => {
            const items = [
                new CollectionItem({contents: 'one'}),
                new CollectionItem({contents: 'two'}),
                new CollectionItem({contents: 'three'})
            ];
            const groups = [];
            const options: any = {
                display: {
                    getMultiSelectVisibility() {
                        return 'hidden';
                    }
                },
                groups,
                groupConstructor: GroupItem,
                handler: () => 'foo'
            };
            const expected = [0, 1, 2, 3];
            const given = Group.sortItems(items, options);

            assert.deepEqual(given, expected);

            assert.equal(groups.length, 1);
            assert.equal(groups[0].getContents(), 'foo');
        });

        it('items without group in start', () => {
            const items = [
                new CollectionItem({ contents: {key: 'one', group: '1'} }),
                new CollectionItem({ contents: {key: 'two', group: '1'} }),
                new CollectionItem({ contents: {key: 'three', group: 'CONTROLS_HIDDEN_GROUP'} })
            ];
            const groups = [];
            const options: any = {
                display: {
                    getMultiSelectVisibility() {
                        return 'hidden';
                    }
                },
                groups,
                groupConstructor: GroupItem,
                handler: (it) => it.group
            };
            const expected = [1, 4, 0, 2, 3];
            const given = Group.sortItems(items, options);

            assert.deepEqual(given, expected);

            assert.equal(groups.length, 2);
            assert.equal(groups[0].getContents(), '1');
            assert.equal(groups[1].getContents(), 'CONTROLS_HIDDEN_GROUP');
        });

        it('should create several groups', () => {
            const items = [
                new CollectionItem({contents: 'one'}),
                new CollectionItem({contents: 'two'}),
                new CollectionItem({contents: 'three'})
            ];
            const groups = [];
            const options: any = {
                display: {
                    getMultiSelectVisibility() {
                        return 'hidden';
                    }
                },
                groups,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            };
            const expected = [0, 3, 1, 4, 2, 5];
            const expectedGroups = ['#one', '#two', '#three'];
            const given = Group.sortItems(items, options);

            assert.deepEqual(given, expected);

            assert.equal(groups.length, 3);
            groups.forEach((group, index) => {
                assert.equal(group.getContents(), expectedGroups[index]);
            });
        });

        it('should use old groups', () => {
            const items = [
                new CollectionItem({contents: 'one'}),
                new CollectionItem({contents: 'two'}),
                new CollectionItem({contents: 'three'})
            ];
            const groups = [
                new GroupItem({contents: '#one'}),
                new GroupItem({contents: '#three'})
            ];
            const options: any = {
                display: {
                    getMultiSelectVisibility() {
                        return 'hidden';
                    }
                },
                groups,
                groupConstructor: GroupItem,
                handler: (item) => '#' + item
            };
            const expected = [0, 3, 2, 4, 1, 5];
            const expectedGroups = ['#one', '#three', '#two'];
            const oldGroups = groups.slice();
            const given = Group.sortItems(items, options);

            assert.deepEqual(given, expected);

            assert.equal(groups.length, 3);
            groups.forEach((group, index) => {
                assert.equal(group.getContents(), expectedGroups[index]);
            });

            assert.deepEqual(groups.slice(0, 2), oldGroups);
        });
    });

    describe('.toJSON()', () => {
        it('should serialize the strategy', () => {
            const json = strategy.toJSON();

            assert.strictEqual(json.state.$options.source, source);
            assert.strictEqual(json.state._groups.length, 0);
        });

        it('should serialize itemsOrder if handler is defined', () => {
            const strategy = new Group({
                source,
                groupConstructor: GroupItem,
                handler: () => '#foo'
            });
            const json = strategy.toJSON() as any;

            assert.strictEqual(json.state._itemsOrder.length, source.count + 1);
        });
    });

    describe('::fromJSON()', () => {
        it('should clone the strategy', () => {
            const groups = strategy.groups;
            const clone = (Group as any).fromJSON(strategy.toJSON());

            assert.deepEqual(clone.groups, groups);
        });
    });
});
