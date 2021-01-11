import { RecordSet } from 'Types/collection';
import { Collection } from 'Controls/display';
import { FlatStrategy } from 'Controls/listDragNDrop';
import { assert } from 'chai';

describe('Controls/_listDragNDrop/strategies/TreeStrategy', () => {
    const items = new RecordSet({
        rawData: [
            { id: 1 },
            { id: 2 },
            { id: 3 }
        ],
        keyProperty: 'id'
    });
    const model = new Collection({
        collection: items
    });

    const strategy = new FlatStrategy(model, model.getItemBySourceKey(2));
    it('move after', () => {
        const targetItem = model.getItemBySourceKey(3);
        const newPosition = strategy.calculatePosition({targetItem});
        assert.deepEqual(newPosition, {
            index: 2,
            position: 'after',
            dispItem: targetItem
        });
    });

    it('move before', () => {
        const targetItem = model.getItemBySourceKey(1);
        const newPosition = strategy.calculatePosition({targetItem});
        assert.deepEqual(newPosition, {
            index: 0,
            position: 'before',
            dispItem: targetItem
        });
    });

    it('move on draggable item', () => {
        const targetItem = model.getItemBySourceKey(2);
        const currentPosition = {
           index: 0,
           position: 'before',
           dispItem: targetItem
       };
        const newPosition = strategy.calculatePosition({targetItem, currentPosition});
        assert.deepEqual(newPosition, currentPosition);
    });
});
