import {TileCollectionItem} from 'Controls/tile';
import {assert} from 'chai';

describe('Controls/_tile/display/mixins/TileItem', () => {
    describe('.getTileWidth', () => {
        describe('tileMode is static', () => {
            it('tileWidth options', () => {
                const item = new TileCollectionItem({tileWidth: 200});
                assert.equal(item.getTileWidth(), 200);
            });

            it('tileWidthProperty priority tileWidth', () => {
                const contents = {width: 250};
                const item = new TileCollectionItem({tileWidth: 200, contents, tileWidthProperty: 'width'});
                assert.equal(item.getTileWidth(), 250);
            });

            it('tileSize priority tileWidthProperty, tileWidth ', () => {
                const contents = {width: 250};
                let item = new TileCollectionItem({tileWidth: 200, contents, tileWidthProperty: 'width', tileSize: 's'});
                assert.equal(item.getTileWidth(), 164);

                item = new TileCollectionItem({tileWidth: 200, contents, tileWidthProperty: 'width', tileSize: 's'});
                assert.equal(item.getTileWidth(undefined, 'left', 'ellipsis'), 300);
            });
        });

        describe('tileMode is dynamic', () => {
            it('count by image size', () => {
                const contents = {imageHeight: 200, imageWidth: 150};
                const item = new TileCollectionItem({tileMode: 'dynamic', contents, imageWidthProperty: 'imageWidth', imageHeightProperty: 'imageHeight'});
                assert.equal(item.getTileWidth(), 250);
            });

            it('count by tileHeight', () => {
                const item = new TileCollectionItem({tileMode: 'dynamic', tileHeight: 300});
                assert.equal(item.getTileWidth(), 300);
            });
        });
    });
});
