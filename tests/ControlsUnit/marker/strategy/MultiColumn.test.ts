import {RecordSet} from 'Types/collection';
import {ColumnsCollection} from 'Controls/columns';
import {default as MultiColumnStrategy} from 'Controls/_marker/strategy/MultiColumn';
import {assert} from 'chai';

let items;
let model;
let strategy;
beforeEach(() => {
    items = new RecordSet({
        rawData: [
            {id: 1},
            {id: 2},
            {id: 3},
            {id: 4}
        ],
        keyProperty: 'id'
    });
    model = new ColumnsCollection({
        keyProperty: 'id',
        collection: items
    });

    strategy = new MultiColumnStrategy({model});
});
/* columns [1, 2]
           [3, 4] */
describe('Controls/_marker/strategy/MultiColumn', () => {
    describe('getMarkedKeyByDirection', () => {
        it('right', () => {
            const newMarkedKey = strategy.getMarkedKeyByDirection(0, 'Right');
            assert.equal(newMarkedKey, 2);
        });

        it('left', () => {
            let newMarkedKey;
            newMarkedKey = strategy.getMarkedKeyByDirection(0, 'Left');
            assert.equal(newMarkedKey, 1);
            newMarkedKey = strategy.getMarkedKeyByDirection(1, 'Left');
            assert.equal(newMarkedKey, 1);
        });

        it('bottom', () => {
            const newMarkedKey = strategy.getMarkedKeyByDirection(0, 'Down');
            assert.equal(newMarkedKey, 3);
        });

        it('up', () => {
            let newMarkedKey;
            newMarkedKey = strategy.getMarkedKeyByDirection(0, 'Up');
            assert.equal(newMarkedKey, 1);
            newMarkedKey = strategy.getMarkedKeyByDirection(2, 'Up');
            assert.equal(newMarkedKey, 1);
        });
    });
});
