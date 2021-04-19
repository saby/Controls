import { assert } from 'chai';
import { TileCollectionItem } from 'Controls/tile';
import {CssClassesAssert} from "ControlsUnit/CustomAsserts";

describe('Controls/_tile/display/mixins/TileItem', () => {
    describe('.getActionMode', () => {
        it('default item', () => {
            const item = new TileCollectionItem();
            assert.equal(item.getActionMode('default'), '');
        });

        it('preview item', () => {
            const item = new TileCollectionItem();
            assert.equal(item.getActionMode('preview'), 'adaptive');
        });

        it('small item', () => {
            const item = new TileCollectionItem();
            assert.equal(item.getActionMode('small'), 'strict');
        });
    });

    describe('.getItemActionsClasses', () => {
        it('default item', () => {
            const item = new TileCollectionItem();
            CssClassesAssert.isSame(item.getItemActionsClasses('default'), 'controls-TileView__itemActions controls-TileView__itemActions_bottomRight');
        });

        it('small item', () => {
            const item = new TileCollectionItem();
            CssClassesAssert.isSame(item.getItemActionsClasses('small'), 'controls-TileView__itemActions controls-TreeTileView__itemActions_center');
        });

        it('medium item', () => {
            const item = new TileCollectionItem();
            CssClassesAssert.isSame(item.getItemActionsClasses('medium'), 'controls-TileView__mediumTemplate_itemActions controls-TileView__itemActions_bottomRight');
        });

        it('rich item', () => {
            const item = new TileCollectionItem();
            CssClassesAssert.isSame(item.getItemActionsClasses('rich'), 'controls-TileView__richTemplate_itemActions controls-TileView__richTemplate_itemActions controls-TileView__itemActions_topRight');
        });

        it('preview item', () => {
            const item = new TileCollectionItem();
            CssClassesAssert.isSame(item.getItemActionsClasses('preview'), 'controls-TileView__previewTemplate_itemActions');
        });
    });
});
