import {TileCollectionItem} from 'Controls/tile';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/_tile/display/mixins/TileItem', () => {
    describe('getWrapperClasses', () => {
        it('small', () => {
            let item = new TileCollectionItem();
            CssClassesAssert.include(item.getWrapperClasses('small'), 'controls-TileView__smallTemplate_wrapper');

            item = new TileCollectionItem({canShowActions: true});
            CssClassesAssert.include(item.getWrapperClasses('small'), 'controls-ListView__item_showActions');
        });
    });
});
