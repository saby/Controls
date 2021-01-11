import { assert } from 'chai';

import { TreeItem } from 'Controls/display';
import { CssClassesAssert } from 'ControlsUnit/CustomAsserts';

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

    describe('expander', () => {
        it('.shouldDisplayExpander()', () => {
            const owner = {
                getExpanderVisibility: () => 'visible',
                getExpanderIcon: () => undefined
            };
            const item = new TreeItem({ owner });

            assert.isTrue(item.shouldDisplayExpander());
            assert.isFalse(item.shouldDisplayExpander('none'));

            item.setNode(null);
            assert.isFalse(item.shouldDisplayExpander());

            item.setNode(true);
            item.setHasChildren(true);
            assert.isTrue(item.shouldDisplayExpander());

            owner.getExpanderVisibility = () => 'hasChildren';
            assert.isTrue(item.shouldDisplayExpander());

            item.setHasChildren(false);
            assert.isFalse(item.shouldDisplayExpander());
        });

        it('.shouldDisplayExpanderPadding()', () => {
            const owner = {
                getExpanderVisibility: () => 'visible',
                getExpanderIcon: () => undefined,
                getExpanderPosition: () => 'default',
                getExpanderSize: () => undefined
            };
            const item = new TreeItem({ owner });

            assert.isTrue(item.shouldDisplayExpanderPadding());
            assert.isFalse(item.shouldDisplayExpanderPadding('none'));
            assert.isFalse(item.shouldDisplayExpanderPadding(undefined, 'xl'));
            owner.getExpanderPosition = () => 'custom';
            assert.isFalse(item.shouldDisplayExpanderPadding());

            item.setHasChildren(false);
            owner.getExpanderVisibility = () => 'hasChildren';
            owner.getExpanderPosition = () => 'default';
            assert.isTrue(item.shouldDisplayExpanderPadding());
            assert.isFalse(item.shouldDisplayExpanderPadding('none'));
            assert.isTrue(item.shouldDisplayExpanderPadding(undefined, 'xl'));
            owner.getExpanderPosition = () => 'custom';
            assert.isFalse(item.shouldDisplayExpanderPadding());

            item.setHasChildren(true);
            owner.getExpanderPosition = () => 'default';
            assert.isFalse(item.shouldDisplayExpanderPadding());
        });

        it('.getExpanderPaddingClasses()', () => {
            const owner = {
                getExpanderSize: () => undefined
            };
            const item = new TreeItem({ owner });

            CssClassesAssert.isSame(item.getExpanderPaddingClasses(), 'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_default_theme-default js-controls-ListView__notEditable');

            owner.getExpanderSize = () => 's';
            CssClassesAssert.isSame(item.getExpanderPaddingClasses(), 'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_s_theme-default js-controls-ListView__notEditable');

            CssClassesAssert.isSame(item.getExpanderPaddingClasses('xl'), 'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_xl_theme-default js-controls-ListView__notEditable');

            CssClassesAssert.isSame(item.getExpanderPaddingClasses('xl', 'custom'), 'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_theme-custom controls-TreeGrid__row-expanderPadding_size_xl_theme-custom js-controls-ListView__notEditable');
        });

        it('.getLevelIndentClasses()', () => {
            const owner = {
                getExpanderSize: () => undefined
            };
            const item = new TreeItem({ owner });

            CssClassesAssert.isSame(item.getLevelIndentClasses(), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_default_theme-default');

            owner.getExpanderSize = () => 's';
            CssClassesAssert.isSame(item.getLevelIndentClasses(), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_s_theme-default');

            CssClassesAssert.isSame(item.getLevelIndentClasses('xl'), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_xl_theme-default');

            CssClassesAssert.isSame(item.getLevelIndentClasses(undefined, 'm'), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_m_theme-default');

            CssClassesAssert.isSame(item.getLevelIndentClasses('xl', 'm'), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_xl_theme-default');

            CssClassesAssert.isSame(item.getLevelIndentClasses('s', 'm'), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_m_theme-default');

            CssClassesAssert.isSame(item.getLevelIndentClasses('xl', 'm', 'custom'), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_xl_theme-custom');
        });

        it('.getExpanderClasses()', () => {
            const owner = {
                getExpanderIcon: () => undefined,
                getExpanderPosition: () => 'default',
                getExpanderSize: () => undefined,
                getTopPadding: () => 'default',
                getBottomPadding: () => 'default'
            };
            const item = new TreeItem({ owner });

            CssClassesAssert.isSame(item.getExpanderClasses(), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_hiddenNode_default_collapsed_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('none'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_none controls-TreeGrid__row-expander_none_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_none_collapsed_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('node'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_node controls-TreeGrid__row-expander_node_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_node_default_collapsed_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('hiddenNode'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_hiddenNode_default_collapsed_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('none', 's'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_s_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_none controls-TreeGrid__row-expander_none_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_none_collapsed_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('node', 'm'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_m_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_node controls-TreeGrid__row-expander_node_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_node_default_collapsed_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('hiddenNode', 'xl'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_xl_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_hiddenNode_default_collapsed_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses(undefined, undefined, 'custom', 'custom'), 'controls-TreeGrid__row-expander_theme-custom controls-TreeGrid__row_custom-expander_size_default_theme-custom js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-custom controls-TreeGrid__row-expander__spacingBottom_default_theme-custom controls-TreeGrid__row-expander_hiddenNode_default_theme-custom controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_hiddenNode_default_collapsed_theme-custom');
            item.setExpanded(false, true);
            CssClassesAssert.isSame(item.getExpanderClasses(), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_hiddenNode_default_collapsed_theme-default');

            item.setExpanded(true, true);
            owner.getExpanderPosition = () => 'custom';
            CssClassesAssert.isSame(item.getExpanderClasses(), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_hiddenNode_default_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('none'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_none controls-TreeGrid__row-expander_none_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_none_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('node'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_node controls-TreeGrid__row-expander_node_default_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_node_default_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('hiddenNode'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_hiddenNode_default_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('none', 's'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_s_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_none controls-TreeGrid__row-expander_none_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_none_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('node', 'm'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_m_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_node controls-TreeGrid__row-expander_node_default_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_node_default_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('hiddenNode', 'xl'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_xl_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_hiddenNode_default_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses(undefined, undefined, 'custom', 'custom'), 'controls-TreeGrid__row-expander_theme-custom controls-TreeGrid__row_custom-expander_size_default_theme-custom js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-custom controls-TreeGrid__row-expander__spacingBottom_default_theme-custom controls-TreeGrid__row-expander_hiddenNode_default_theme-custom controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_hiddenNode_default_expanded_theme-custom');
            item.setExpanded(false, true);
            CssClassesAssert.isSame(item.getExpanderClasses(), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_default-expander_size_default_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_hiddenNode_default_collapsed_theme-default');

            item.setExpanded(true, true);
            owner.getExpanderPosition = () => 'right';
            CssClassesAssert.isSame(item.getExpanderClasses(), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_expander_position_right_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_hiddenNode_default_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('none'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_expander_position_right_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_none controls-TreeGrid__row-expander_none_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_none_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('node'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_expander_position_right_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_node controls-TreeGrid__row-expander_node_default_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_node_default_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('hiddenNode'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_expander_position_right_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_hiddenNode_default_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('none', 's'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_expander_position_right_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_none controls-TreeGrid__row-expander_none_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_none_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('node', 'm'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_expander_position_right_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_node controls-TreeGrid__row-expander_node_default_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_node_default_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses('hiddenNode', 'xl'), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_expander_position_right_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_hiddenNode_default_expanded_theme-default');
            CssClassesAssert.isSame(item.getExpanderClasses(undefined, undefined, 'custom', 'custom'), 'controls-TreeGrid__row-expander_theme-custom controls-TreeGrid__row_expander_position_right_theme-custom js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-custom controls-TreeGrid__row-expander__spacingBottom_default_theme-custom controls-TreeGrid__row-expander_hiddenNode_default_theme-custom controls-TreeGrid__row-expander_expanded controls-TreeGrid__row-expander_hiddenNode_default_expanded_theme-custom');
            item.setExpanded(false, true);
            CssClassesAssert.isSame(item.getExpanderClasses(), 'controls-TreeGrid__row-expander_theme-default controls-TreeGrid__row_expander_position_right_theme-default js-controls-ListView__notEditable controls-TreeGrid__row-expander__spacingTop_default_theme-default controls-TreeGrid__row-expander__spacingBottom_default_theme-default controls-TreeGrid__row-expander_hiddenNode_default_theme-default controls-TreeGrid__row-expander_collapsed controls-TreeGrid__row-expander_hiddenNode_default_collapsed_theme-default');
        });
    });

    describe('.isHasChildren()', () => {
        it('should return false by default', () => {
            const item = new TreeItem();
            assert.isFalse(item.isHasChildren());
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
