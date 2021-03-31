import { assert } from 'chai';

import { GroupItem } from 'Controls/display';

describe('Controls/_display/GroupItem', () => {
    const getOwnerMock = () => {
        return {
            lastChangedItem: undefined,
            lastChangedProperty: undefined,
            notifyItemChange(item: GroupItem<string>, property: string): void {
                this.lastChangedItem = item;
                this.lastChangedProperty = property;
            }
        };
    };

    describe('.isExpanded()', () => {
        it('should return true by default', () => {
            const item = new GroupItem();
            assert.isTrue(item.isExpanded());
        });

        it('should return value passed to the constructor', () => {
            const item = new GroupItem({expanded: false});
            assert.isFalse(item.isExpanded());
        });
    });

    describe('.setExpanded()', () => {
        it('should set the new value', () => {
            const item = new GroupItem();

            item.setExpanded(false);
            assert.isFalse(item.isExpanded());

            item.setExpanded(true);
            assert.isTrue(item.isExpanded());
        });

        it('should notify owner if changed', () => {
            const owner = getOwnerMock();
            const item = new GroupItem({
                owner: owner as any
            });

            item.setExpanded(false);

            assert.strictEqual(owner.lastChangedItem, item);
            assert.strictEqual(owner.lastChangedProperty, 'expanded');
        });

        it('should not notify owner if changed in silent mode', () => {
            const owner = getOwnerMock();
            const item = new GroupItem({
                owner: owner as any
            });

            item.setExpanded(false, true);

            assert.isUndefined(owner.lastChangedItem);
            assert.isUndefined(owner.lastChangedProperty);
        });
    });

    describe('.toggleExpanded()', () => {
        it('should toggle the value', () => {
            const item = new GroupItem();

            item.toggleExpanded();
            assert.isFalse(item.isExpanded());

            item.toggleExpanded();
            assert.isTrue(item.isExpanded());
        });
    });

    describe('isSticked', () => {
        it('sticky enabled', () => {
            const owner = { isStickyHeader: () => true };
            const item = new GroupItem({owner});
            assert.isTrue(item.isSticked());
        });

        it('sticky disabled', () => {
            const owner = { isStickyHeader: () => false };
            const item = new GroupItem({owner});
            assert.isFalse(item.isSticked());
        });

        it('hidden group', () => {
            const owner = { isStickyHeader: () => true };
            const item = new GroupItem({owner, contents: 'CONTROLS_HIDDEN_GROUP'});
            assert.isFalse(item.isSticked());
        });
    });
});
