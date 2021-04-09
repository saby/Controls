import { assert } from 'chai';

import { RecordSet } from 'Types/collection';
import TileCollection from 'Controls/_tile/display/TileCollection';
import TileView from 'Controls/_tile/TileView';

describe('Controls/_tile/TileView', () => {
    let tileView, model;
    beforeEach(() => {
        model = new TileCollection({
            tileMode: 'static',
            tileHeight: 300,
            imageProperty: 'image',
            keyProperty: 'id',
            collection: new RecordSet({
                rawData: [{
                    id: 1,
                    image: 'image1'
                }, {
                    id: 2,
                    image: 'image2'
                }],
                keyProperty: 'id'
            })
        });

        const cfg = {
            listModel: model,
            keyProperty: 'id',
            tileScalingMode: 'outside',
            tileWidth: 200,
            useNewModel: true
        };

        tileView = new TileView(cfg);
        tileView.saveOptions(cfg);
        tileView._beforeMount(cfg);
    });

    describe('_onResize', () => {
        it('should reset hovered item', () => {
            const event = {
                type: ''
            };
            model.setHoveredItem(model.getItemBySourceKey(1));
            tileView._onResize(event);
            assert.equal(model.getHoveredItem(), null);
        });

        it('not should reset hovered item', () => {
            const event = {
                type: 'animationend'
            };
            model.setHoveredItem(model.getItemBySourceKey(1));
            tileView._onResize(event);
            assert.equal(model.getHoveredItem().key, 1);
        });
    });
});
