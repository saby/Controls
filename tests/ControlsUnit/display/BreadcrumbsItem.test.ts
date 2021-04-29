import { assert } from 'chai';

import { TreeItem } from 'Controls/display';
import BreadcrumbsItem from 'Controls/_display/BreadcrumbsItem';

describe('Controls/_display/BreadcrumbsItem', () => {
    describe('.getContents()', () => {
        it('should return tree branch', () => {
            const items = [];
            items[0] = new TreeItem({
                contents: 'a'
            });
            items[1] = new TreeItem({
                parent: items[0],
                contents: 'b'
            });
            items[2] = new TreeItem({
                parent: items[1],
                contents: 'c'
            });
            const expected = [['a'], ['a', 'b'], ['a', 'b', 'c']];

            items.forEach((item, index) => {
                const bcItem = new BreadcrumbsItem({
                    last: item
                });
                const expectedBreadcrumbs = expected[index];

                assert.deepEqual(bcItem.getBreadcrumbs(), expectedBreadcrumbs);
                assert.deepEqual(bcItem.getContents(), expectedBreadcrumbs[expectedBreadcrumbs.length - 1]);
            });
        });

        it('should return tree branch with root', () => {
            const root = new TreeItem({
                contents: 'root'
            });
            const owner = {
                getRoot: () => {
                    return null;
                }
            };
            const item = new TreeItem({
                parent: root,
                contents: 'a'
            });
            const bcItem = new BreadcrumbsItem<string[] | string>({
                owner: owner as any,
                last: item
            });

            const expectedArr = ['root', 'a'];
            assert.deepEqual(bcItem.getBreadcrumbs(), expectedArr);
            assert.deepEqual(bcItem.getContents(), expectedArr[expectedArr.length - 1]);
        });

        it('should return tree branch without root', () => {
            const root = new TreeItem({
                contents: 'root'
            });
            const owner = {
                getRoot: () => {
                    return root;
                }
            };
            const item = new TreeItem({
                parent: root,
                contents: 'a'
            });
            const bcItem = new BreadcrumbsItem<string[] | string>({
                owner: owner as any,
                last: item
            });

            const expectedArr = ['a'];
            assert.deepEqual(bcItem.getBreadcrumbs(), expectedArr);
            assert.deepEqual(bcItem.getContents(), expectedArr[expectedArr.length - 1]);
        });
    });

    describe('.getLevel()', () => {
        it('should return 0 by default', () => {
            const item = new BreadcrumbsItem();
            assert.strictEqual(item.getLevel(), 0);
        });

        it('should start counter with value given by getRootLevel() method', () => {
            const owner: any = {
                getRoot: () => root,
                getRootLevel: () => 3
            };
            const root = new TreeItem({
                contents: 'root',
                owner
            });
            const last = new TreeItem({
                owner,
                parent: root,
                contents: 'last'
            });
            const item = new BreadcrumbsItem({
                owner,
                last
            });
            assert.strictEqual(root.getLevel(), 3);
            assert.strictEqual(item.getLevel(), 4);
        });
    });

    describe('.isRoot()', () => {
        it('be default false', () => {
            const item = new BreadcrumbsItem();
            assert.isFalse(item.isRoot());
        });
    });
});
