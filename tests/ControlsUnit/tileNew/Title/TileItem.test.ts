import {assert} from 'chai';

import {TileCollectionItem} from 'Controls/tile';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';
import {Model} from "Types/entity";

describe('Controls/_tile/display/mixins/TileItem', () => {
    describe('getTitleWrapperClasses', () => {
        it('small', () => {
            const item = new TileCollectionItem();
            CssClassesAssert.include(item.getTitleWrapperClasses('small'), 'controls-TileView__smallTemplate_title');
        });
        it('rich', () => {
            const item = new TileCollectionItem();
            CssClassesAssert.include(item.getTitleWrapperClasses('rich'), 'controls-TileView__richTemplate_itemContent ws-ellipsis');
        });
        it('preview', () => {
            const item = new TileCollectionItem();
            const classes = item.getTitleWrapperClasses('preview');
            CssClassesAssert.include(classes, 'controls-TileView__previewTemplate_title controls-fontsize-m');
            CssClassesAssert.include(classes, 'controls-TileView__previewTemplate_title_singleLine');
            CssClassesAssert.include(classes, 'controls-TileView__previewTemplate_title_gradient_dark');
            CssClassesAssert.include(classes, 'controls-TileView__previewTemplate_title_text_light');

            CssClassesAssert.include(item.getTitleWrapperClasses('preview', 2), 'controls-TileView__previewTemplate_title_multiLine');
        });
    });

    describe('shouldDisplayTitle', () => {
        describe('default', () => {
            const owner = {
                getDisplayProperty: () => 'display'
            };

            it('without display value', () => {
                const contents = new Model({
                    rawData: {display: '', id: 1},
                    keyProperty: 'id'
                });
                const item = new TileCollectionItem({contents, owner});
                assert.isFalse(item.shouldDisplayTitle('default'));
            });

            it('with display value', () => {
                const contents = new Model({
                    rawData: {display: '111', id: 1},
                    keyProperty: 'id'
                });
                const item = new TileCollectionItem({contents, owner});
                assert.isTrue(item.shouldDisplayTitle('default'));
            });

            it('has visible actions', () => {
                const contents = new Model({
                    rawData: {display: '', id: 1},
                    keyProperty: 'id'
                });
                const actions = {showed: ['action1']};
                const item = new TileCollectionItem({contents, owner, actions});
                assert.isTrue(item.shouldDisplayTitle('default'));
            });

            it('is editing', () => {
                const contents = new Model({
                    rawData: {display: '', id: 1},
                    keyProperty: 'id'
                });
                const item = new TileCollectionItem({contents, owner, editing: true});
                assert.isTrue(item.shouldDisplayTitle('default'));
            });
        });

        it('small', () => {
            const item = new TileCollectionItem();
            assert.isTrue(item.shouldDisplayTitle('small'));
        });

        it('medium', () => {
            const item = new TileCollectionItem();
            assert.isTrue(item.shouldDisplayTitle('medium'));
        });

        it('rich', () => {
            const item = new TileCollectionItem();
            assert.isTrue(item.shouldDisplayTitle('rich'));
        });

        describe('preview', () => {
            it('can show actions and has visible actions', () => {
                const actions = {showed: ['action1']};
                const item = new TileCollectionItem({actions, canShowActions: true});
                assert.isFalse(item.shouldDisplayTitle('preview'));
            });

            it('not can show actions and has visible actions', () => {
                const actions = {showed: ['action1']};
                const item = new TileCollectionItem({actions, canShowActions: false});
                assert.isTrue(item.shouldDisplayTitle('preview'));
            });

            it('can show actions and not has visible actions', () => {
                const actions = {showed: []};
                const item = new TileCollectionItem({actions, canShowActions: true});
                assert.isTrue(item.shouldDisplayTitle('preview'));
            });

            it('not can show actions and not has visible actions', () => {
                const actions = {showed: []};
                const item = new TileCollectionItem({actions, canShowActions: false});
                assert.isTrue(item.shouldDisplayTitle('preview'));
            });
        });
    });
});
