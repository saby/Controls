import { assert } from 'chai';

import TreeItemDecorator from 'Controls/_display/TreeItemDecorator';
import { TreeItem } from 'Controls/display';


describe('Controls/_display/TreeItemDecorator', () => {
    describe('.getSource()', () => {
        it('should return undefined by default', () => {
            const item = new TreeItemDecorator();
            assert.isUndefined(item.getSource());
        });

        it('should return injected source', () => {
            const source = new TreeItem();
            const item = new TreeItemDecorator({source});
            assert.strictEqual(item.getSource(), source);
        });
    });

    describe('.getOwner()', () => {
        it('should return source\'s owner', () => {
            const owner: any = {};
            const source = new TreeItem({owner});
            const item = new TreeItemDecorator({source});
            assert.strictEqual(item.getOwner(), owner);
        });
    });

    describe('.setOwner()', () => {
        it('should set source\'s owner', () => {
            const owner: any = {};
            const source = new TreeItem();
            const item = new TreeItemDecorator({source});
            item.setOwner(owner);
            assert.strictEqual(source.getOwner(), owner);
        });
    });

    describe('.getContents()', () => {
        it('should return source\'s contents', () => {
            const contents: any = {};
            const source = new TreeItem({contents});
            const item = new TreeItemDecorator({source});
            assert.strictEqual(item.getContents(), contents);
        });
    });

    describe('.setContents()', () => {
        it('should set source\'s contents', () => {
            const contents: any = {};
            const source = new TreeItem();
            const item = new TreeItemDecorator({source});
            item.setContents(contents);
            assert.strictEqual(source.getContents(), contents);
        });
    });

    describe('.getUid()', () => {
        it('should return source\'s uid', () => {
            const source = new TreeItem();
            const item = new TreeItemDecorator({source});
            assert.strictEqual(item.getUid(), source.getUid());
        });
    });

    describe('.isSelected()', () => {
        it('should return source is selected', () => {
            const selected = true;
            const source = new TreeItem({selected});
            const item = new TreeItemDecorator({source});
            assert.strictEqual(item.isSelected(), selected);
        });
    });

    describe('.setSelected()', () => {
        it('should set source is selected', () => {
            const selected = true;
            const source = new TreeItem();
            const item = new TreeItemDecorator({source});
            item.setSelected(selected);
            assert.strictEqual(source.isSelected(), selected);
        });
    });

    describe('.getRoot()', () => {
        it('should return source\'s root', () => {
            const source = new TreeItem();
            const item = new TreeItemDecorator({source});
            assert.strictEqual(item.getRoot(), source.getRoot());
        });
    });

    describe('.isRoot()', () => {
        it('should return source is root', () => {
            const source = new TreeItem();
            const item = new TreeItemDecorator({source});
            assert.strictEqual(item.isRoot(), source.isRoot());
        });
    });

    describe('.isNode()', () => {
        it('should return source is node', () => {
            const node = true;
            const source = new TreeItem({node});
            const item = new TreeItemDecorator({source});
            assert.strictEqual(item.isNode(), node);
        });
    });

    describe('.setNode()', () => {
        it('should set source is node', () => {
            const node = true;
            const source = new TreeItem();
            const item = new TreeItemDecorator({source});
            item.setNode(node);
            assert.strictEqual(source.isNode(), node);
        });
    });

    describe('.isExpanded()', () => {
        it('should return source is expanded', () => {
            const expanded = true;
            const source = new TreeItem({expanded});
            const item = new TreeItemDecorator({source});
            assert.strictEqual(item.isExpanded(), expanded);
        });
    });

    describe('.setExpanded()', () => {
        it('should set source is expanded', () => {
            const expanded = true;
            const source = new TreeItem();
            const item = new TreeItemDecorator({source});
            item.setExpanded(expanded);
            assert.strictEqual(source.isExpanded(), expanded);
        });
    });

    describe('.toggleExpanded()', () => {
        it('should toggles source\'s expanded', () => {
            const source = new TreeItem();
            const item = new TreeItemDecorator({source});
            item.toggleExpanded();
            assert.strictEqual(source.isExpanded(), item.isExpanded());
            item.toggleExpanded();
            assert.strictEqual(source.isExpanded(), item.isExpanded());
        });
    });

    describe('.isHasChildren()', () => {
        it('should return source has children', () => {
            const hasChildren = true;
            const source = new TreeItem({hasChildren});
            const item = new TreeItemDecorator({source});
            assert.strictEqual(item.isHasChildren(), hasChildren);
        });
    });

    describe('.setHasChildren()', () => {
        it('should set source has children', () => {
            const hasChildren = true;
            const source = new TreeItem();
            const item = new TreeItemDecorator({source});
            item.setHasChildren(hasChildren);
            assert.strictEqual(source.isHasChildren(), hasChildren);
        });
    });

    describe('.getChildrenProperty()', () => {
        it('should return source\'s children property', () => {
            const childrenProperty = 'foo';
            const source = new TreeItem({childrenProperty});
            const item = new TreeItemDecorator({source});
            assert.strictEqual(item.getChildrenProperty(), childrenProperty);
        });
    });
});
