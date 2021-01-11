define(['Controls/_tile/View'], function(Tile) {
    'use strict';
    it('shouldOpenExtendedMenu', () => {
        const tileControl = new Tile.default({});
        tileControl._options = {
            tileScalingMode: 'none',
            actionMenuViewMode: 'preview'
        };
        const itemData = {
            isNode: () => false
        };

        assert.isTrue(tileControl._shouldOpenExtendedMenu(false, true, itemData));
        assert.isFalse(tileControl._shouldOpenExtendedMenu(true, false, itemData));
        tileControl._options.tileScalingMode = 'overlap';
        assert.isTrue(tileControl._shouldOpenExtendedMenu(false, true, itemData));
        tileControl._options.tileScalingMode = 'inside';
        assert.isFalse(tileControl._shouldOpenExtendedMenu(false, true, itemData));
    });
});
