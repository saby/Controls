import { assert } from 'chai';

import { TreeItem } from 'Controls/display';

describe('Controls/_display/TreeItem', () => {
    const Owner = function(): void {
        this.lastChangedItem = undefined;
        this.lastChangedProperty = undefined;
        this.notifyItemChange = (item, property) => {
            this.lastChangedItem = item;
            this.lastChangedProperty = property;
        };
    };

    const getOwnerMock = () => {
        return new Owner();
    };

    describe('.getParent()', () => {
        it('should return undefined by default', () => {
            const item = new TreeItem();
            assert.isUndefined(item.getParent());
        });

        it('should return value passed to the constructor', () => {
            const parent = new TreeItem();
            const item = new TreeItem({parent});

            assert.strictEqual(item.getParent(), parent);
        });
    });

    describe('.getRoot()', () => {
        it('should return itself by default', () => {
            const item = new TreeItem();
            assert.strictEqual(item.getRoot(), item);
        });

        it('should return root of the parent', () => {
            const parent = new TreeItem();
            const item = new TreeItem({parent});

            assert.strictEqual(item.getRoot(), parent.getRoot());
        });
    });

    describe('.isRoot()', () => {
        it('should return true by default', () => {
            const item = new TreeItem();
            assert.isTrue(item.isRoot());
        });

        it('should return false if has parent', () => {
            const parent = new TreeItem();
            const item = new TreeItem({parent});

            assert.isFalse(item.isRoot());
        });
    });

    describe('.getLevel()', () => {
        it('should return 0 by default', () => {
            const item = new TreeItem();
            assert.strictEqual(item.getLevel(), 0);
        });

        it('should return value differs by +1 from the parent', () => {
            const root = new TreeItem();
            const level1 = new TreeItem({parent: root});
            const level2 = new TreeItem({parent: level1});

            assert.strictEqual(root.getLevel(), 0);
            assert.strictEqual(level1.getLevel(), root.getLevel() + 1);
            assert.strictEqual(level2.getLevel(), level1.getLevel() + 1);
        });

        it('should start counter with value given by getRootLevel() method', () => {
            const rootLevel = 3;
            const OwnerWithRoot = function(): void {
                this.getRoot = () => root;
                this.getRootLevel = () => rootLevel;
            };
            const owner = new OwnerWithRoot();
            const root = new TreeItem({owner});
            const level1 = new TreeItem({
                parent: root,
                owner
            });
            const level2 = new TreeItem({
                parent: level1,
                owner
            });

            assert.strictEqual(root.getLevel(), rootLevel);
            assert.strictEqual(level1.getLevel(), root.getLevel() + 1);
            assert.strictEqual(level2.getLevel(), level1.getLevel() + 1);
        });
    });

    describe('.isNode()', () => {
        it('should return false by default', () => {
            const item = new TreeItem();
            assert.isFalse(item.isNode());
        });

        it('should return value passed to the constructor', () => {
            const item = new TreeItem({node: true});
            assert.isTrue(item.isNode());
        });
    });

    describe('.isExpanded()', () => {
        it('should return false by default', () => {
            const item = new TreeItem();
            assert.isFalse(item.isExpanded());
        });

        it('should return value passed to the constructor', () => {
            const item = new TreeItem({expanded: true});
            assert.isTrue(item.isExpanded());
        });
    });

    describe('.setExpanded()', () => {
        it('should set the new value', () => {
            const item = new TreeItem();

            item.setExpanded(true);
            assert.isTrue(item.isExpanded());

            item.setExpanded(false);
            assert.isFalse(item.isExpanded());
        });

        it('should notify owner if changed', () => {
            const owner = getOwnerMock();
            const item = new TreeItem({
                owner
            });

            item.setExpanded(true);

            assert.strictEqual(owner.lastChangedItem, item);
            assert.strictEqual(owner.lastChangedProperty, 'expanded');
        });

        it('should not notify owner if changed in silent mode', () => {
            const owner = getOwnerMock();
            const item = new TreeItem({
                owner
            });

            item.setExpanded(true, true);

            assert.isUndefined(owner.lastChangedItem);
            assert.isUndefined(owner.lastChangedProperty);
        });
    });

    describe('.toggleExpanded()', () => {
        it('should toggle the value', () => {
            const item = new TreeItem();

            item.toggleExpanded();
            assert.isTrue(item.isExpanded());

            item.toggleExpanded();
            assert.isFalse(item.isExpanded());
        });
    });

    describe('.isHasChildren()', () => {
        it('should return true by default', () => {
            const item = new TreeItem();
            assert.isTrue(item.isHasChildren());
        });

        it('should return value passed to the constructor', () => {
            const item = new TreeItem({hasChildren: false});
            assert.isFalse(item.isHasChildren());
        });
    });

    describe('.setHasChildren()', () => {
        it('should set the new value', () => {
            const item = new TreeItem();

            item.setHasChildren(false);
            assert.isFalse(item.isHasChildren());

            item.setHasChildren(true);
            assert.isTrue(item.isHasChildren());
        });
    });

    describe('.isLoaded()', () => {
        it('should return false by default', () => {
            const item = new TreeItem();
            assert.isFalse(item.isLoaded());
        });

        it('should return value passed to the constructor', () => {
            const item = new TreeItem({loaded: true});
            assert.isTrue(item.isLoaded());
        });
    });

    describe('.setLoaded()', () => {
        it('should set the new value', () => {
            const item = new TreeItem();

            item.setLoaded(true);
            assert.isTrue(item.isLoaded());

            item.setLoaded(false);
            assert.isFalse(item.isLoaded());
        });
    });

    describe('.getChildrenProperty()', () => {
        it('should return na empty string by default', () => {
            const item = new TreeItem();
            assert.strictEqual(item.getChildrenProperty(), '');
        });

        it('should return value passed to the constructor', () => {
            const name = 'test';
            const item = new TreeItem({childrenProperty: name});

            assert.strictEqual(item.getChildrenProperty(), name);
        });
    });

    describe('.toJSON()', () => {
        it('should serialize the tree item', () => {
            const item = new TreeItem();
            const json = item.toJSON();
            const options = (item as any)._getOptions();

            delete options.owner;

            assert.strictEqual(json.module, 'Controls/display:TreeItem');
            assert.deepEqual(json.state.$options, options);
        });
    });
});
