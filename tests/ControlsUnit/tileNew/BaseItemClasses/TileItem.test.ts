import {TileCollectionItem} from 'Controls/tile';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/_tile/display/mixins/TileItem', () => {
    describe('getWrapperClasses', () => {
        it('titleStyle', () => {
            const owner = {
                getDisplayProperty: () => ''
            };

            const item = new TileCollectionItem({owner});
            let classes = item.getWrapperClasses('', '', '', '', '', '', '', 'accent');
            CssClassesAssert.include(classes, 'controls-TileView__itemContent_accent');
        });

        it('small', () => {
            let item = new TileCollectionItem();
            CssClassesAssert.include(item.getWrapperClasses('small'), 'controls-TileView__smallTemplate_wrapper');

            item = new TileCollectionItem({canShowActions: true});
            CssClassesAssert.include(item.getWrapperClasses('small'), 'controls-ListView__item_showActions');
        });
    });
});
