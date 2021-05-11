import { assert } from 'chai';
import TreeTileCollectionItem from 'Controls/_treeTile/display/TreeTileCollectionItem';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';
import {Model} from "Types/entity";

describe('Controls/_treeTile/display/TreeTileCollectionItem', () => {
    describe('.getItemStyles', () => {
        it('is node and default template', () => {
            const item = new TreeTileCollectionItem({node: true, nodesHeight: 100});
            assert.equal(item.getItemStyles('default'), '-ms-flex-preferred-size: 250px; flex-basis: 250px;');
            assert.equal(item.getItemStyles('default', 300), '-ms-flex-preferred-size: 300px; flex-basis: 300px;');
            assert.equal(item.getItemStyles('default', 300, true), '-ms-flex-preferred-size: 300px; flex-basis: 300px; height: 100px;');
        });

        it('is node and small template', () => {
            const item = new TreeTileCollectionItem({node: true, nodesHeight: 100});
            assert.equal(item.getItemStyles('default'), '-ms-flex-preferred-size: 250px; flex-basis: 250px;');
            assert.equal(item.getItemStyles('default', 300), '-ms-flex-preferred-size: 300px; flex-basis: 300px;');
            assert.equal(item.getItemStyles('default', 300, true), '-ms-flex-preferred-size: 300px; flex-basis: 300px; height: 100px;');
        });
    });

    describe('getTitleWrapperClasses', () => {
        it('small', () => {
            const item = new TreeTileCollectionItem({node: true});
            CssClassesAssert.include(item.getTitleWrapperClasses('small'), 'controls-TileView__smallTemplate_title_node');
        });
        it('preview', () => {
            const item = new TreeTileCollectionItem({node: true});
            const classes = item.getTitleWrapperClasses('preview');
            CssClassesAssert.include(classes, 'controls-fontweight-bold');
            CssClassesAssert.include(classes, 'controls-fontsize-l');
        });
    });

    describe('shouldDisplayTitle', () => {
        describe('preview', () => {
            const owner = {
                getDisplayProperty: () => 'display'
            };
            const contents = new Model({
                rawData: {display: '123', id: 1},
                keyProperty: 'id'
            });
            it('can show actions and has visible actions and not is node', () => {
                const actions = {showed: ['action1']};
                const item = new TreeTileCollectionItem({actions, canShowActions: true, owner, contents});
                assert.isFalse(!!item.shouldDisplayTitle('preview'));
            });

            it('can show actions and has visible actions and is node', () => {
                const actions = {showed: ['action1']};
                const item = new TreeTileCollectionItem({actions, canShowActions: true, node: true, owner, contents});
                assert.isTrue(item.shouldDisplayTitle('preview'));
            });
        });
    });
});
