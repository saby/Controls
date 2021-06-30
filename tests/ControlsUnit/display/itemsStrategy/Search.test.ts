import { assert } from 'chai';

import { TreeItem, Search as SearchCollection, Tree, IItemsStrategy, itemsStrategy, BreadcrumbsItem, SearchSeparator } from 'Controls/display';
import { RecordSet } from 'Types/collection';


// Данные

/* В виде иерархии
    A
    AA
       AAA
          AAAa
          AAAb
       AAB
       AAC
          AAACa
       AAD
    B
    C
    d
    e
 */

/* В виде поиска
    [A]
    [A, AA, AAA]
      AAAa
      AAAb
    [A, AA, AAB]
    [A, AA, AAC]
      AACa
    [A, AA, AAD]
    [B]
    [C]
    -----
    d
    e
 */

describe('Controls/_display/itemsStrategy/Search', () => {
    class StringContents {
        constructor(props: object, protected _prop: string = 'id') {
            Object.assign(this, props);
        }

        toString(): string {
            return this[this._prop];
        }
    }

    function getSource<T>(items: T[], options: object = {}): IItemsStrategy<T, T> {
        return {
            '[Controls/_display/IItemsStrategy]': true,
            options,
            source: null,
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
            splice(start: number, deleteCount: number, added?: any[]): T[] {
                return items.splice(start, deleteCount, ...added);
            },
            invalidate(): void {
                // always up to date
            },
            reset(): void {
                items.length = 0;
            }
        };
    }

    function stringifyResult(contents) {
        let result: string;
        if (contents instanceof Array) {
            result = `#${contents.join(',')}`;
        } else {
            result = contents;
        }
        return result;
    }

    let items: Array<TreeItem<string>>;
    let source: IItemsStrategy<any, TreeItem<string>>;
    let strategy: itemsStrategy.Search<string>;
    const display: SearchCollection = new SearchCollection({
        collection: new RecordSet({}),
        root: null
    });

    beforeEach(() => {
        items = [];
        items[0] = new TreeItem({
            parent: display.getRoot(),
            contents: 'A',
            node: true
        });
        items[1] = new TreeItem({
            parent: items[0],
            contents: 'AA',
            node: true
        });
        items[2] = new TreeItem({
            parent: items[1],
            contents: 'AAA',
            node: true
        });
        items[3] = new TreeItem({
            parent: items[2],
            contents: 'AAAa'
        });
        items[4] = new TreeItem({
            parent: items[2],
            contents: 'AAAb'
        });
        items[5] = new TreeItem({
            parent: items[1],
            contents: 'AAB',
            node: true
        });
        items[6] = new TreeItem({
            parent: items[1],
            contents: 'AAC',
            node: true
        });
        items[7] = new TreeItem({
            parent: items[6],
            contents: 'AACa'
        });
        items[8] = new TreeItem({
            parent: items[1],
            contents: 'AAD',
            node: true
        });
        items[9] = new TreeItem({
            parent: display.getRoot(),
            contents: 'B',
            node: true
        });
        items[10] = new TreeItem({
            parent: display.getRoot(),
            contents: 'C',
            node: true
        });
        items[11] = new TreeItem({
            parent: display.getRoot(),
            contents: 'd'
        });
        items[12] = new TreeItem({
            parent: display.getRoot(),
            contents: 'e'
        });

        source = getSource(items, {display});
        strategy = new itemsStrategy.Search({
            source,
            display,
            treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
        });
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

    describe('.items', () => {
        it('should group breadcrumbs nodes', () => {
            const strategy = new itemsStrategy.Search<string | string[]>({
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const expected = [
                '#A,AA,AAA',
                'AAAa',
                'AAAb',
                '#A,AA,AAB',
                '#A,AA,AAC',
                'AACa',
                '#A,AA,AAD',
                '#B',
                '#C',
                'search-separator',
                'd',
                'e'
            ];

            strategy.items.forEach((item, index) => {
                assert.equal(stringifyResult(item.getContents()), expected[index], `at ${index}`);
            });

            assert.strictEqual(strategy.items.length, expected.length);
        });

        it('should group only breadcrumbs nodes', () => {
            const items = [];
            items[0] = new TreeItem({
                parent: display.getRoot(),
                contents: 'A',
                node: true
            });
            items[1] = new TreeItem({
                parent: items[0],
                contents: 'AA',
                node: true
            });
            items[2] = new TreeItem({
                parent: items[1],
                contents: 'AAA',
                node: true
            });

            const source = getSource(items, {display});
            const strategy = new itemsStrategy.Search({
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const result = strategy.items.map((item) => stringifyResult(item.getContents()));

            assert.deepEqual(result, ['#A,AA,AAA']);
        });

        it('should put children of hidden node after the breadcrumbs', () => {
            const items = [];
            items[0] = new TreeItem({
                contents: 'a',
                node: false
            });
            items[1] = new TreeItem({
                parent: items[0],
                contents: 'B',
                node: true
            });
            items[2] = new TreeItem({
                parent: items[0],
                contents: 'c',
                node: null
            });
            items[3] = new TreeItem({
                parent: items[0],
                contents: 'D',
                node: true
            });

            const source = getSource(items, {display});
            const strategy = new itemsStrategy.Search({
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const result = strategy.items.map((item) => stringifyResult(item.getContents()));

            assert.deepEqual(result, ['a', '#a,B', '#a', 'c', '#a,D']);
        });

        it('should add breadcrumbs before a leaf which has different parent than previous leaf', () => {
            const items = [];
            items[0] = new TreeItem({
                parent: display.getRoot(),
                contents: 'A',
                node: true
            });
            items[1] = new TreeItem({
                parent: items[0],
                contents: 'B',
                node: true
            });
            items[2] = new TreeItem({
                parent: items[1],
                contents: 'c',
                node: false
            });
            items[3] = new TreeItem({
                parent: items[0],
                contents: 'd',
                node: false
            });

            const source = getSource(items, {display});
            const strategy = new itemsStrategy.Search({
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const result = strategy.items.map((item) => stringifyResult(item.getContents()));

            assert.deepEqual(result, ['#A,B', 'c', '#A', 'd']);
        });

        it('should return valid items level for first item after breadcrumbs', () => {
            const items = [];
            items[0] = new TreeItem({
                parent: display.getRoot(),
                contents: 'A',
                node: true
            });
            items[1] = new TreeItem({
                parent: items[0],
                contents: 'AA',
                node: true
            });
            items[2] = new TreeItem({
                parent: items[1],
                contents: 'AAa',
                node: false
            });
            items[3] = new TreeItem({
                parent: display.getRoot(),
                contents: 'b',
                node: false
            });

            const source = getSource(items, {display});
            const strategy = new itemsStrategy.Search({
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const result = strategy.items.map((item) => stringifyResult(item.getContents())  + ':' + item.getLevel());

            assert.deepEqual(result, ['#A,AA:1', 'AAa:2', 'search-separator:0', 'b:1']);
        });

        it('return breadcrumbs as 1st level parent for leaves', () => {
            const parents = [];
            parents[1] = BreadcrumbsItem;
            parents[2] = BreadcrumbsItem;
            parents[3] = BreadcrumbsItem;
            parents[4] = BreadcrumbsItem;
            parents[5] = BreadcrumbsItem;
            parents[6] = BreadcrumbsItem;
            parents[7] = BreadcrumbsItem;
            parents[8] = BreadcrumbsItem;
            parents[9] = undefined; // separator
            parents[10] = display.getRoot();
            parents[11] = display.getRoot();
            parents[12] = display.getRoot();

            const levels = [];
            levels[1] = 2;
            levels[2] = 2;
            levels[3] = 2;
            levels[4] = 2;
            levels[5] = 2;
            levels[6] = 2;
            levels[7] = 2;
            levels[8] = 2;
            levels[9] = 0; // separator
            levels[10] = 1;
            levels[11] = 1;
            levels[12] = 1;

            strategy.items.forEach((item, index) => {
                if (item instanceof TreeItem) {
                    if (typeof parents[index] === 'function') {
                        assert.instanceOf(
                            item.getParent(),
                            parents[index],
                            'at ' + index
                        );
                    } else {
                        assert.strictEqual(
                            item.getParent(),
                            parents[index],
                            'at ' + index
                        );
                    }

                    assert.equal(
                        item.getLevel(),
                        levels[index],
                        'at ' + index
                    );
                }
            });
        });

        it('shouldn place leaves before nodes for single breadcrumbs', () => {
            items = [];
            items[0] = new TreeItem({
                parent: display.getRoot(),
                contents: 'A',
                node: true
            });
            items[1] = new TreeItem({
                parent: items[0],
                contents: 'b'
            });
            items[2] = new TreeItem({
                parent: items[0],
                contents: 'C',
                node: true
            });
            items[3] = new TreeItem({
                parent: items[2],
                contents: 'd'
            });
            items[4] = new TreeItem({
                parent: items[0],
                contents: 'e'
            });

            source = getSource(items, {display});
            strategy = new itemsStrategy.Search({
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const result = strategy.items.map((item) => stringifyResult(item.getContents())  + ':' + item.getLevel());

            assert.deepEqual(result, ['#A:1', 'b:2', 'e:2', '#A,C:1', 'd:2']);
        });

        it('should keep level for descendant of leaf', () => {
            items = [];
            items[0] = new TreeItem({
                parent: display.getRoot(),
                contents: 'A',
                node: true
            });
            items[1] = new TreeItem({
                parent: items[0],
                contents: 'b'
            });
            items[2] = new TreeItem({
                parent: items[1],
                contents: 'c'
            });

            source = getSource(items, {display});
            strategy = new itemsStrategy.Search({
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const result = strategy.items.map((item) => stringifyResult(item.getContents())  + ':' + item.getLevel());

            assert.deepEqual(result, ['#A:1', 'b:2', 'c:3']);
        });

        it('shouldn\'t return breadcrumbs finished with leaf', () => {
            items = [];
            items[0] = new TreeItem({
                parent: display.getRoot(),
                contents: 'A',
                node: true
            });
            const leaf = items[1] = new TreeItem({
                parent: items[0],
                contents: 'b'
            });
            items[2] = new TreeItem({
                parent: leaf,
                contents: 'C',
                node: true
            });
            items[3] = new TreeItem({
                parent: items[2],
                contents: 'd'
            });
            items[4] = new TreeItem({
                parent: leaf,
                contents: 'e'
            });
            items[5] = new TreeItem({
                parent: items[2],
                contents: 'f'
            });

            source = getSource(items, {display});
            strategy = new itemsStrategy.Search({
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const result = strategy.items.map((item) => stringifyResult(item.getContents())  + ':' + item.getLevel());

            assert.deepEqual(result, ['#A:1', 'b:2', 'e:3', '#A,b,C:1', 'd:2', 'f:2']);
        });

        it('should organize dedicated breadcrumbs for first item', () => {
            const items = [];
            items[0] = new TreeItem({
                parent: display.getRoot(),
                contents: new StringContents({id: 'A', break: true}),
                node: true
            });
            items[1] = new TreeItem({
                parent: items[0],
                contents: new StringContents({id: 'AA', break: false}),
                node: true
            });
            items[2] = new TreeItem({
                parent: items[1],
                contents: new StringContents({id: 'AAA', break: false}),
                node: true
            });

            const source = getSource(items, {display});
            const strategy = new itemsStrategy.Search({
                dedicatedItemProperty: 'break',
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const result = strategy.items.map((item) => {
                const contents = item.getContents();
                return item instanceof BreadcrumbsItem ? `#${contents.join(',')}` : contents;
            });

            assert.deepEqual(result, ['#A', '#A,AA,AAA']);
        });

        it('should organize dedicated breadcrumbs for inner item', () => {
            const items = [];
            items[0] = new TreeItem({
                parent: display.getRoot(),
                contents: new StringContents({id: 'A', break: false}),
                node: true
            });
            items[1] = new TreeItem({
                parent: items[0],
                contents: new StringContents({id: 'AA', break: true}),
                node: true
            });
            items[2] = new TreeItem({
                parent: items[1],
                contents: new StringContents({id: 'AAA', break: false}),
                node: true
            });

            const source = getSource(items, {display});
            const strategy = new itemsStrategy.Search({
                dedicatedItemProperty: 'break',
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const result = strategy.items.map((item) => {
                const contents = item.getContents();
                return item instanceof BreadcrumbsItem ? `#${contents.join(',')}` : contents;
            });

            assert.deepEqual(result, ['#A,AA', '#A,AA,AAA']);
        });

        it('should organize dedicated breadcrumbs for last item', () => {
            const items = [];
            items[0] = new TreeItem({
                parent: display.getRoot(),
                contents: new StringContents({id: 'A', break: false}),
                node: true
            });
            items[1] = new TreeItem({
                parent: items[0],
                contents: new StringContents({id: 'AA', break: false}),
                node: true
            });
            items[2] = new TreeItem({
                parent: items[1],
                contents: new StringContents({id: 'AAA', break: true}),
                node: true
            });

            const source = getSource(items, {display});
            const strategy = new itemsStrategy.Search({
                dedicatedItemProperty: 'break',
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const result = strategy.items.map((item) => {
                const contents = item.getContents();
                return item instanceof BreadcrumbsItem ? `#${contents.join(',')}` : contents;
            });

            assert.deepEqual(result, ['#A,AA,AAA']);
        });

        it('should return the same instances for second call', () => {
            const items = strategy.items.slice();

            strategy.items.forEach((item, index) => {
                assert.strictEqual(items[index], item);
            });

            assert.equal(items.length, strategy.items.length);
        });
    });

    describe('.count', () => {
        it('should return items count', () => {
            assert.equal(strategy.count, 12);
        });
    });

    describe('.getDisplayIndex()', () => {
        it('should return index in projection', () => {
            const next = strategy.count;
            // 9th item is a separator, created by strategy
            const expected = [next, next, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11];
            items.forEach((item, index) => {
                assert.equal(strategy.getDisplayIndex(index), expected[index], 'at ' + index);
            });
        });
    });

    describe('.getCollectionIndex()', () => {
        it('should return index in collection', () => {
            const expected = [-1, 3, 4, -1, -1, 7, -1, -1, -1, -1, 11, 12];
            strategy.items.forEach((item, index) => {
                assert.equal(strategy.getCollectionIndex(index), expected[index], 'at ' + index);
            });
        });
    });

    describe('.splice()', () => {
        it('should add items', () => {
            const source = getSource(items, {display});
            const strategy = new itemsStrategy.Search<string | string[]>({
                source: source as any,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            const newItems = [new TreeItem({
                parent: items[2],
                contents: 'AAAc'
            })];
            const at = 3;
            const expected = [
                '#A,AA,AAA',
                'AAAc',
                'AAAa',
                'AAAb',
                '#A,AA,AAB',
                '#A,AA,AAC',
                'AACa',
                '#A,AA,AAD',
                '#B',
                '#C',
                'search-separator',
                'd',
                'e'
            ];

            strategy.splice(at, 0, newItems as any);

            strategy.items.forEach((item, index) => {
                assert.equal(
                    stringifyResult(item.getContents()),
                    expected[index],
                    'at ' + index
                );
            });

            assert.strictEqual(strategy.items.length, expected.length);
        });

        it('should remove items', () => {
            const strategy = new itemsStrategy.Search<string | string[]>({
                source,
                display,
                treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
            });

            // AA
            const at = 1;

            // AA + AAA
            const sourceRemoveCount = 2;
            const removeCount = 2;
            const expected = [
                '#A',
                '#A,AA,AAA',
                'AAAa',
                'AAAb',
                '#A,AA,AAB',
                '#A,AA,AAC',
                'AACa',
                '#A,AA,AAD',
                '#B',
                '#C',
                'search-separator',
                'd',
                'e'
            ];

            const sourceCount = source.count;
            strategy.splice(at, removeCount, []);

            assert.strictEqual(source.count, sourceCount - sourceRemoveCount);

            assert.strictEqual(strategy.count, expected.length);

            strategy.items.forEach((item, index) => {
                assert.equal(
                    stringifyResult(item.getContents()),
                    expected[index],
                    'at ' + index
                );
            });
        });
    });

    describe('.reset()', () => {
        it('should reset items', () => {
            strategy.reset();
            assert.strictEqual(strategy.items.length, 0);
        });
    });

    it('right parent for items', () => {
        const recordSet = new RecordSet({
            rawData: [{
                id: 1,
                parent: null,
                node: true,
                hasChildren: true
            }, {
                id: 2,
                parent: 1,
                node: false,
                hasChildren: false
            }, {
                id: 3,
                parent: null,
                node: null,
                hasChildren: false
            }],
            keyProperty: 'id'
        });

        const searchCollection = new SearchCollection({
            collection: recordSet,
            root: null,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'node',
            hasChildrenProperty: 'hasChildren'
        });

        const items = searchCollection.getItems();
        assert.isTrue(items[0].getParent().isRoot());
        assert.equal(items[1].getParent(), items[0]);
        assert.instanceOf(items[2], SearchSeparator);
        assert.isTrue(items[3].getParent().isRoot());
    });
});
