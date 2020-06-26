import { assert } from 'chai';
import { TreeItemsUtil } from 'Controls/list';
import { RecordSet } from 'Types/collection';

describe('Controls/list_clean/TreeItemsUtil', () => {
    const keyProperty = 'key';
    const parentProperty = 'parent';
    const data = [
        {
            key: 'level_root_item_1',
            parent: 'root',
            type: true
        }, {
            key: 'level_1_item_1',
            parent: 'level_root_item_1',
            type: true
        }, {
            key: 'level_2_item_1',
            parent: 'level_1_item_1',
            type: null
        }, {
            key: 'level_root_item_2',
            parent: 'root',
            type: true
        }, {
            key: 'level_1_item_1',
            parent: 'level_root_item_2',
            type: true
        }
    ];
    const items: RecordSet = new RecordSet({
        rawData: data,
        keyProperty
    });

    describe('getUniqueParentKey', () => {
        it('Check item 0', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueParentKey(items.at(0), items, keyProperty, parentProperty),
                'root');
        });

        it('Check item 1', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueParentKey(items.at(1), items, keyProperty, parentProperty),
                'level_root_item_1,root');
        });

        it('Check item 2', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueParentKey(items.at(2), items, keyProperty, parentProperty),
                'level_1_item_1,level_root_item_1,root');
        });

        it('Check item 3', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueParentKey(items.at(3), items, keyProperty, parentProperty),
                'root');
        });

        it('Check item 4', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueParentKey(items.at(4), items, keyProperty, parentProperty),
                'level_root_item_2,root');
        });
    });

    describe('getUniqueHierarchicalKey', () => {
        it('Check item 0', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueHierarchicalKey(items.at(0), items, keyProperty, parentProperty),
                'level_root_item_1,root');
        });

        it('Check item 1', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueHierarchicalKey(items.at(1), items, keyProperty, parentProperty),
                'level_1_item_1,level_root_item_1,root');
        });

        it('Check item 2', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueHierarchicalKey(items.at(2), items, keyProperty, parentProperty),
                'level_2_item_1,level_1_item_1,level_root_item_1,root');
        });

        it('Check item 3', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueHierarchicalKey(items.at(3), items, keyProperty, parentProperty),
                'level_root_item_2,root');
        });

        it('Check item 4', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueHierarchicalKey(items.at(4), items, keyProperty, parentProperty),
                'level_1_item_1,level_root_item_2,root');
        });
    });

    describe('Custom separator', () => {
        it('getUniqueParentKey', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueParentKey(items.at(2), items, keyProperty, parentProperty, '|'),
                'level_1_item_1|level_root_item_1|root');
        });

        it('getUniqueHierarchicalKey', () => {
            assert.deepEqual(TreeItemsUtil.getUniqueHierarchicalKey(items.at(2), items, keyProperty, parentProperty, '|'),
                'level_2_item_1|level_1_item_1|level_root_item_1|root');
        });
    });
});
