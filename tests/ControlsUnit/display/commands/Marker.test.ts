import { assert } from 'chai';

import * as MarkerCommands from 'Controls/_display/commands/Marker';

describe('Controls/_display/commands/Marker', () => {
    function makeMarkerItem(initialMarked: boolean): MarkerCommands.IMarkerItem {
        const item = {
            _$marked: initialMarked,
            isMarked: () => item._$marked,
            setMarked: (marked: boolean) => item._$marked = marked
        };
        return item;
    }

    function makeCollection() {
        const collection = {
            _version: 0,
            getVersion: () => collection._version,
            nextVersion: () => collection._version++,
            find: () => null,
            getItemBySourceKey: () => null,
            getNext: () => null,
            getPrevious: () => null
        };
        return collection;
    }

    describe('Marker::Mark', () => {
        it('unmarks the currently marked item', () => {
            const oldMarkedItem = makeMarkerItem(true);

            const collection = makeCollection();
            collection.find = () => oldMarkedItem;

            const command = new MarkerCommands.Mark(null);
            command.execute(collection);

            assert.isFalse(oldMarkedItem.isMarked());
            assert.isAbove(collection.getVersion(), 0);
        });
        it('marks the item with passed key', () => {
            const newMarkedItem = makeMarkerItem(false);

            const collection = makeCollection();
            collection.getItemBySourceKey = () => newMarkedItem;

            const command = new MarkerCommands.Mark('new');
            command.execute(collection);

            assert.isTrue(newMarkedItem.isMarked());
            assert.isAbove(collection.getVersion(), 0);
        });
    });

    describe('Marker::MarkNext', () => {
        it('moves marker from current item to next', () => {
            const oldMarkedItem = makeMarkerItem(true);
            const newMarkedItem = makeMarkerItem(false);

            const collection = makeCollection();
            collection.find = () => oldMarkedItem;
            collection.getNext = () => newMarkedItem;

            const command = new MarkerCommands.MarkNext();
            command.execute(collection);

            assert.isFalse(oldMarkedItem.isMarked());
            assert.isTrue(newMarkedItem.isMarked());
            assert.isAbove(collection.getVersion(), 0);
        });
        it('does not change anything if there is no marked item', () => {
            const newMarkedItem = makeMarkerItem(false);

            const collection = makeCollection();
            collection.getNext = () => newMarkedItem;

            const command = new MarkerCommands.MarkNext();
            command.execute(collection);

            assert.isFalse(newMarkedItem.isMarked());
            assert.strictEqual(collection.getVersion(), 0);
        });
        it('does not change anything if there is no next item', () => {
            const oldMarkedItem = makeMarkerItem(true);

            const collection = makeCollection();
            collection.find = () => oldMarkedItem;

            const command = new MarkerCommands.MarkNext();
            command.execute(collection);

            assert.isTrue(oldMarkedItem.isMarked());
            assert.strictEqual(collection.getVersion(), 0);
        });
    });

    describe('Marker::MarkPrevious', () => {
        it('moves marker from current item to previous', () => {
            const oldMarkedItem = makeMarkerItem(true);
            const newMarkedItem = makeMarkerItem(false);

            const collection = makeCollection();
            collection.find = () => oldMarkedItem;
            collection.getPrevious = () => newMarkedItem;

            const command = new MarkerCommands.MarkPrevious();
            command.execute(collection);

            assert.isFalse(oldMarkedItem.isMarked());
            assert.isTrue(newMarkedItem.isMarked());
            assert.isAbove(collection.getVersion(), 0);
        });
        it('does not change anything if there is no marked item', () => {
            const newMarkedItem = makeMarkerItem(false);

            const collection = makeCollection();
            collection.getPrevious = () => newMarkedItem;

            const command = new MarkerCommands.MarkPrevious();
            command.execute(collection);

            assert.isFalse(newMarkedItem.isMarked());
            assert.strictEqual(collection.getVersion(), 0);
        });
        it('does not change anything if there is no previous item', () => {
            const oldMarkedItem = makeMarkerItem(true);

            const collection = makeCollection();
            collection.find = () => oldMarkedItem;

            const command = new MarkerCommands.MarkPrevious();
            command.execute(collection);

            assert.isTrue(oldMarkedItem.isMarked());
            assert.strictEqual(collection.getVersion(), 0);
        });
    });
});
