import {TileCollectionItem} from 'Controls/tile';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

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
});
