import TileCollection from 'Controls/_tile/display/TileCollection';
import {RecordSet} from 'Types/collection';
import { assert } from 'chai';

describe('Controls/_tile/display/TileCollection', () => {
    it('create items with all tile params', () => {
        const items = new RecordSet({
            rawData: [
                {id: 1}
            ]
        });
        const model = new TileCollection({
            collection: items,
            tileMode: 'static',
            tileScalingMode: 'outside',
            tileSize: 's',
            tileWidthProperty: 'tileWidth',
            imageWidthProperty: 'imageWidth',
            imageHeightProperty: 'imageHeight',
            imageProperty: 'image',
            imageFit: 'imageFit',
            imageUrlResolver: 'imageUrlResolver',
            roundBorder: {tl: '1px', tr: '2px', bl: '3px', br: '4px'}
        });
        const item = model.at(0);
        
        assert.equal(item.getTileMode(), 'static');
        assert.equal(item.getTileScalingMode(), 'outside');
        assert.equal(item.getTileSize(), 's');
        assert.equal(item.getTileWidthProperty(), 'tileWidth');
        assert.equal(item.getImageWidthProperty(), 'imageWidth');
        assert.equal(item.getImageHeightProperty(), 'imageHeight');
        assert.equal(item.getImageProperty(), 'image');
        assert.equal(item.getImageFit(), 'imageFit');
        assert.equal(item.getImageUrlResolver(), 'imageUrlResolver');
        assert.equal(item.getTopLeftRoundBorder(), '1px');
        assert.equal(item.getTopRightRoundBorder(), '2px');
        assert.equal(item.getBottomLeftRoundBorder(), '3px');
        assert.equal(item.getBottomRightRoundBorder(), '4px');
    });
});
