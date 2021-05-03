import { assert } from 'chai';
import TreeTileCollectionItem from 'Controls/_treeTile/display/TreeTileCollectionItem';
import {TileCollectionItem} from "Controls/tile";
import {CssClassesAssert} from "ControlsUnit/CustomAsserts";

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
});
