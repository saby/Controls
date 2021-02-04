import { assert } from 'chai';
import { BreadcrumbsItem, Search } from 'Controls/display';


describe('Controls/_display/Search', () => {
    describe('.each()', () => {
        it('should group breadcumbs in one item', () => {
            const items = [{
                id: 'A',
                pid: '+',
                node: true
            }, {
                id: 'AA',
                pid: 'A',
                node: true
            }, {
                id: 'AAa',
                pid: 'AA',
                node: false
            }, {
                id: 'AB',
                pid: 'A',
                node: true
            }, {
                id: 'ABa',
                pid: 'AB',
                node: false
            }, {
                id: 'AC',
                pid: 'A',
                node: true
            }, {
                id: 'B',
                pid: '+',
                node: true
            }, {
                id: 'Ba',
                pid: 'B',
                node: false
            }, {
                id: 'C',
                pid: '+',
                node: true
            }];
            const search = new Search({
                collection: items,
                root: {id: '+'},
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
            const expected = [['A', 'AA'], 'AAa', ['A', 'AB'], 'ABa', ['A', 'AC'], ['B'], 'Ba', ['C']];

            assert.equal(search.getCount(), expected.length);

            search.each((item, index) => {
                if (item instanceof BreadcrumbsItem) {
                    assert.deepEqual((item.getContents() as any).map((i) => i.id), expected[index], 'at ' + index);
                } else {
                    assert.equal(item.getContents().id, expected[index], 'at ' + index);
                }
            });
        });

        it('should build full path for breadcrumbs in unique mode', () => {
            const items = [{
                id: 'A',
                pid: '+',
                node: true
            }, {
                id: 'AA',
                pid: 'A',
                node: true
            }, {
                id: 'AAA',
                pid: 'AA',
                node: true
            }, {
                id: 'AAAa',
                pid: 'AAA'
            }, {
                id: 'AA',
                pid: 'A',
                node: true
            }, {
                id: 'AAB',
                pid: 'AA',
                node: true
            }, {
                id: 'AABa',
                pid: 'AAB'
            }];
            const search = new Search({
                collection: items,
                root: {id: '+'},
                unique: true,
                keyProperty: 'id',
                parentProperty: 'pid',
                nodeProperty: 'node'
            });
            const expected = [['A', 'AA', 'AAA'], 'AAAa', ['A', 'AA', 'AAB'], 'AABa'];

            assert.equal(search.getCount(), expected.length);

            search.each((item, index) => {
                if (item instanceof BreadcrumbsItem) {
                    assert.deepEqual((item.getContents() as any).map((i) => i.id), expected[index], 'at ' + index);
                } else {
                    assert.equal(item.getContents().id, expected[index], 'at ' + index);
                }
            });
        });
    });
});
