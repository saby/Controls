import { assert } from 'chai';
import { TileCollectionItem } from 'Controls/tile';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/_tile/display/mixins/TileItem/Footer', () => {
    describe('shouldDisplayFooterTemplate', () => {
        it('not pass footerTemplate', () => {
            const item = new TileCollectionItem();
            assert.isFalse(item.shouldDisplayFooterTemplate('small', null, 'wrapper'));
            assert.isFalse(item.shouldDisplayFooterTemplate('preview', null, 'content'));
        });

        it('small item', () => {
            const item = new TileCollectionItem();
            assert.isTrue(item.shouldDisplayFooterTemplate('small', () => '', 'wrapper'));
            assert.isFalse(item.shouldDisplayFooterTemplate('small', () => '', 'content'));
        });

        it('preview item', () => {
            const item = new TileCollectionItem();
            assert.isFalse(item.shouldDisplayFooterTemplate('preview', () => '', 'wrapper'));
            assert.isTrue(item.shouldDisplayFooterTemplate('preview', () => '', 'content'));
        });

        it('not support footer for another items', () => {
            const item = new TileCollectionItem();
            assert.isFalse(item.shouldDisplayFooterTemplate('rich', () => '', 'wrapper'));
            assert.isFalse(item.shouldDisplayFooterTemplate('rich', () => '', 'content'));
            assert.isFalse(item.shouldDisplayFooterTemplate('default', () => '', 'wrapper'));
            assert.isFalse(item.shouldDisplayFooterTemplate('default', () => '', 'content'));
            assert.isFalse(item.shouldDisplayFooterTemplate('medium', () => '', 'wrapper'));
            assert.isFalse(item.shouldDisplayFooterTemplate('medium', () => '', 'content'));
        });
    });

    describe('getFooterClasses', () => {
        it('by default', () => {
            const item = new TileCollectionItem();
            CssClassesAssert.include(item.getFooterClasses(), 'controls-TileView__item_footer');
        });
    });
});
