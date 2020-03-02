import { assert } from 'chai';

import * as DragCommands from 'Controls/_display/commands/Drag';
import DragStrategy from 'Controls/_display/itemsStrategy/Drag';

describe('Controls/_display/commands/Drag', () => {
    function makeCollection() {
        const collection = {
            _version: 0,
            getVersion: () => collection._version,
            nextVersion: () => collection._version++,
            appendStrategy: () => null,
            getStrategyInstance: () => null,
            removeStrategy: () => null,
            getIndexByKey: () => -1
        };
        return collection;
    }

    describe('Drag::Start', () => {
        it('appends DragStrategy to collection with options', () => {
            const draggedItemsKeys = [5, 6, 8, 9];
            const avatarItemKey = 5;
            const avatarIndex = 100;

            const collection = makeCollection();
            collection.getIndexByKey = (key) => key === avatarItemKey ? avatarIndex : -1;

            let appendedStrategy;
            let appendedOptions;
            collection.appendStrategy = (strategy, options) => {
                appendedStrategy = strategy;
                appendedOptions = options;
            };

            const command = new DragCommands.Start(draggedItemsKeys, avatarItemKey);
            command.execute(collection);

            assert.strictEqual(appendedStrategy, DragStrategy);
            assert.deepEqual(appendedOptions, {
                draggedItemsKeys,
                avatarItemKey,
                avatarIndex
            });
        });
    });

    describe('Drag::Move', () => {
        it('updates strategy options', () => {
            const strategyInstance = {
                avatarIndex: 10
            };

            const collection = makeCollection();
            collection.getStrategyInstance = (strategy) => strategy === DragStrategy ? strategyInstance : null;

            const command = new DragCommands.Move(15);
            command.execute(collection);

            assert.strictEqual(strategyInstance.avatarIndex, 15);
            assert.isAbove(collection.getVersion(), 0);
        });
    });

    describe('Drag::Stop', () => {
        it('removes strategy from collection', () => {
            let removedDragStrategy = false;

            const collection = makeCollection();
            collection.removeStrategy = (strategy) => removedDragStrategy = strategy === DragStrategy;

            const command = new DragCommands.Stop();
            command.execute(collection);

            assert.isTrue(removedDragStrategy);
        });
    });
});
