import { assert } from 'chai';

import * as EditInPlaceController from 'Controls/_display/controllers/EditInPlace';
import AddInPlaceStrategy from 'Controls/_display/itemsStrategy/AddInPlace';

describe('Controls/_display/controllers/EditInPlace', () => {
    function makeEditInPlaceItem(initialEditing: boolean) {
        const item = {
            _$editing: initialEditing,
            _$editingContents: null,
            isEditing: () => item._$editing,
            setEditing: (editing, editingContents) => {
                item._$editing = editing;
                item._$editingContents = editingContents;
            }
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
            appendStrategy: () => null,
            removeStrategy: () => null,
            getEditingConfig: () => null
        };
        return collection;
    }

    describe('beginEdit()', () => {
        it('stops editing of edited item', () => {
            const oldEditItem = makeEditInPlaceItem(true);

            const collection = makeCollection();
            collection.find = () => oldEditItem;

            EditInPlaceController.beginEdit(collection, null);

            assert.isFalse(oldEditItem.isEditing());
            assert.isAbove(collection.getVersion(), 0);
        });
        it('starts editing of item with passed key', () => {
            const editingContents = {};
            const newEditItem = makeEditInPlaceItem(false);

            const collection = makeCollection();
            collection.getItemBySourceKey = () => newEditItem;

            EditInPlaceController.beginEdit(collection, 'abc', editingContents);

            assert.isTrue(newEditItem.isEditing());
            assert.strictEqual(newEditItem._$editingContents, editingContents);
            assert.isAbove(collection.getVersion(), 0);
        });
    });

    describe('endEdit()', () => {
        it('stops editing of edited item', () => {
            const oldEditItem = makeEditInPlaceItem(true);

            const collection = makeCollection();
            collection.find = () => oldEditItem;

            EditInPlaceController.endEdit(collection);

            assert.isFalse(oldEditItem.isEditing());
            assert.isAbove(collection.getVersion(), 0);
        });
    });

    describe('beginAdd()', () => {
        it('adds strategy with options', () => {
            const editingContents = {};
            const collection = makeCollection();

            let appendedStrategy;
            let appendedOptions;
            collection.appendStrategy = (strategy, options) => {
                appendedStrategy = strategy;
                appendedOptions = options;
            };
            collection.getEditingConfig = () => ({
                addPosition: 'top'
            });

            EditInPlaceController.beginAdd(collection, editingContents);

            assert.strictEqual(appendedStrategy, AddInPlaceStrategy);
            assert.deepEqual(appendedOptions, {
                contents: editingContents,
                addIndex: 0
            });
        });
    });

    describe('endAdd()', () => {
        it('removes strategy', () => {
            const collection = makeCollection();

            let removedAddInPlaceStrategy = false;
            collection.removeStrategy = (strategy) => removedAddInPlaceStrategy = strategy === AddInPlaceStrategy;

            EditInPlaceController.endAdd(collection);

            assert.isTrue(removedAddInPlaceStrategy);
        });
    });

    describe('isEditing()', () => {
        it('returns editing state', () => {
            const editItem = {};

            const collection = makeCollection();

            assert.isFalse(EditInPlaceController.isEditing(collection));

            collection.find = () => editItem;
            assert.isTrue(EditInPlaceController.isEditing(collection));
        });
    });

    describe('getEditedItem()', () => {
        it('returns edited item', () => {
            const editItem = {};

            const collection = makeCollection();
            collection.find = () => editItem;

            assert.strictEqual(
                EditInPlaceController.getEditedItem(collection),
                editItem
            );
        });
    });
});
