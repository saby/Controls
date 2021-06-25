import { RecordSet } from 'Types/collection';
import {Collection, groupConstants} from 'Controls/display';
import {FlatStrategy} from 'Controls/listDragNDrop';
import { assert } from 'chai';

describe('Controls/_listDragNDrop/strategies/FlatStrategy', () => {
    const items = new RecordSet({
        rawData: [
            { id: 1 },
            { id: 2, group: 1 },
            { id: 3, group: 1 }
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

    it('move outside list', () => {
        const newPosition = strategy.calculatePosition({targetItem: null});
        assert.deepEqual(newPosition, {
            index: 1,
            dispItem: model.getItemBySourceKey(2)
        });
    });

    describe('right count position around group', () => {
        let display;
        beforeEach(() => {
            const items = new RecordSet({
                rawData: [
                    {id: 1, group: groupConstants.hiddenGroup},
                    {id: 2, group: groupConstants.hiddenGroup},
                    {id: 3, group: 'group-1'},
                    {id: 4, group: 'group-1'}
                ],
                keyProperty: 'id'
            });
            display = new Collection({
                collection: items,
                groupProperty: 'group'
            });

        });

        it('firstly move after group', () => {
            const modelWithGroup = new Collection({
                collection: items,
                groupProperty: 'group'
            });
            const strategy = new FlatStrategy(modelWithGroup, model.getItemBySourceKey(0));

            const targetItem = modelWithGroup.at(2);
            const newPosition = strategy.calculatePosition({targetItem, currentPosition: null});
            assert.deepEqual(
                newPosition,
                {
                    dispItem: targetItem,
                    position: 'before',
                    index: 2
                }
            );
        });

        it('move before group', () => {
            const strategy = new FlatStrategy(display, display.getItemBySourceKey(3));
            const targetItem = display.getItemBySourceKey('group-1');
            const newPosition = strategy.calculatePosition({ targetItem });
            assert.deepEqual(
                newPosition,
                {
                    dispItem: targetItem,
                    position: 'before',
                    index: 3
                }
            );
        });

        it('move after group', () => {
            const strategy = new FlatStrategy(display, display.getItemBySourceKey(2));
            const targetItem = display.getItemBySourceKey('group-1');
            const newPosition = strategy.calculatePosition({ targetItem });
            assert.deepEqual(
                newPosition,
                {
                    dispItem: targetItem,
                    position: 'after',
                    index: 3
                }
            );
        });
    });
});
