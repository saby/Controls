import { assert } from 'chai';
import { TileCollectionItem } from 'Controls/tile';

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
});
