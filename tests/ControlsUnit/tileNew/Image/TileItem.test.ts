import { assert } from 'chai';
import { TileCollectionItem } from 'Controls/tile';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/_tile/display/mixins/TileItem', () => {
    describe('.getImageHeightAttribute', () => {
        it('rich item', () => {
            const item = new TileCollectionItem();
            assert.equal(item.getImageHeightAttribute('rich'), '');
        });

        it('default item', () => {
            const item = new TileCollectionItem();
            assert.equal(item.getImageHeightAttribute(), '100%');
        });
    });

    describe('getImageClasses', () => {
        describe('rich', () => {
            it('by default', () => {
                const item = new TileCollectionItem();
                const result = item.getImageClasses('rich', undefined, 'center', 'rectangle', 1, 'top', 's');
                CssClassesAssert.isSame(result, 'controls-TileView__richTemplate_image controls-TileView__richTemplate_image_viewMode_rectangle controls-TileView__richTemplate_image_size_s_position_top_viewMode_rectangle controls-TileView__richTemplate_image_size_s_position_top');
            });

            it('contains controls-TileView__image', () => {
                const item = new TileCollectionItem();
                let result = item.getImageClasses('rich', undefined, 'center', 'rectangle', 0.5, 'top');
                CssClassesAssert.include(result, 'controls-TileView__image controls-TileView__image_align_center');

                result = item.getImageClasses('rich', undefined, 'center', '', 0.5, 'top');
                CssClassesAssert.notInclude(result, 'controls-TileView__image controls-TileView__image_align_center');

                result = item.getImageClasses('rich', undefined, 'center', '', 0.5, 'top', 'xl');
                CssClassesAssert.include(result, 'controls-TileView__image controls-TileView__image_align_center');

                result = item.getImageClasses('rich', undefined, 'center', 'rectangle', 1, 'top');
                CssClassesAssert.notInclude(result, 'controls-TileView__image controls-TileView__image_align_center');
            });

            it('setup image size', () => {
                const item = new TileCollectionItem();
                let result = item.getImageClasses('rich', undefined, 'center', 'rectangle', 1, 'top', '', '', '1:1');
                CssClassesAssert.notInclude(result, 'controls-TileView__richTemplate_image_size_');

                result = item.getImageClasses('rich', undefined, 'center', 'rectangle', 1, 'top', 's', '');
                CssClassesAssert.include(result, 'controls-TileView__richTemplate_image_size_s_position_top_viewMode_rectangle');
                CssClassesAssert.include(result, 'controls-TileView__richTemplate_image_size_s_position_top');

                result = item.getImageClasses('rich', undefined, 'center', 'ellipsis', 1, 'top', 's', '', '1:1');
                CssClassesAssert.include(result, 'controls-TileView__richTemplate_image_size_s_position_top_viewMode_ellipsis');
                CssClassesAssert.include(result, 'controls-TileView__richTemplate_image_size_s_position_top');

                result = item.getImageClasses('rich', undefined, 'center', 'rectangle', 1, 'left', 's', '', '1:1');
                CssClassesAssert.include(result, 'controls-TileView__richTemplate_image_size_s_position_left_viewMode_rectangle');
                CssClassesAssert.include(result, 'controls-TileView__richTemplate_image_size_s_position_vertical');
            });
        });
    });
});
