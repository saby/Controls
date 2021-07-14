import { ColumnsCollection } from 'Controls/columns';
import { RecordSet } from 'Types/collection';
import { assert } from 'chai';
import { Model } from 'Types/entity';

describe('Columns/display/ColumnsIndexes/CollectionItem/GetColumn', () => {
    describe('default', () => {
        let rs;
        let collection;
        let result = [];

        const getColumnEach = (item) => {
            result.push(item.getColumn());
        };

        beforeEach(() => {
            rs = new RecordSet({
                keyProperty: 'id',
                rawData: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((id) => {
                    return {
                        id
                    };
                })
            });
            result = [];
            collection = new ColumnsCollection({collection: rs, columnsCount: 3});
        });
        it('initial state check', () => {
            const expected = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2];
            collection.each(getColumnEach);
            assert.deepEqual(result, expected, 'wrong initial columnIndexes');
        });
        it('remove single item', () => {
            const expected = [1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2];
            rs.removeAt(0);
            collection.each(getColumnEach);
            assert.deepEqual(result, expected, 'wrong ColumnIndexes after removing one item');
        });
        it('remove several items', () => {
            const expected = [0, 1, 2, 0, 1, 2, 0, 1, 2];
            const itemsToRemove = [rs.at(0), rs.at(1), rs.at(2)];
            itemsToRemove.forEach((item) => {
                rs.remove(item);
            });
            collection.each(getColumnEach);
            assert.deepEqual(result, expected, 'wrong ColumnIndexes after removing several item');
        });
        it('remove from last column', () => {
            const expected = [0, 1, 0, 1, 0, 1, 0, 1];
            const itemsToRemove = [rs.at(2), rs.at(5), rs.at(8), rs.at(11)];
            itemsToRemove.forEach((item) => {
                rs.remove(item);
            });
            collection.each(getColumnEach);
            assert.deepEqual(result, expected, 'wrong ColumnIndexes after removing several item');
        });
        it('add item', () => {
            const expected = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0];
            const newItem = new Model({keyProperty: 'id', rawData: {id: 12}});
            rs.add(newItem);
            collection.each(getColumnEach);
            assert.deepEqual(result, expected, 'wrong ColumnIndexes after adding one item');
        });
        it('add item at 0', () => {
            const expected = [0, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2];
            const newItem = new Model({keyProperty: 'id', rawData: {id: 12}});
            rs.add(newItem, 0);
            collection.each(getColumnEach);
            assert.deepEqual(result, expected, 'wrong ColumnIndexes after adding one item');
        });
        it('add item at position', () => {
            const expected = [0, 1, 2, 0, 1, 2, 2, 0, 1, 2, 0, 1, 2];
            const newItem = new Model({keyProperty: 'id', rawData: {id: 12}});
            rs.add(newItem, 5);
            collection.each(getColumnEach);
            assert.deepEqual(result, expected, 'wrong ColumnIndexes after adding one item');
        });
    });
    describe('viewMode = list', () => {
        let rs;
        let collection;
        let result = [];

        const getColumnEach = (item) => {
            result.push(item.getColumn());
        };

        beforeEach(() => {
            rs = new RecordSet({
                keyProperty: 'id',
                rawData: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((id) => {
                    return {
                        id
                    };
                })
            });
            result = [];
            collection = new ColumnsCollection({viewMode: 'list', collection: rs, columnsCount: 3});
        });
        it('add item', () => {
            const expected = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0];
            const newItem = new Model({keyProperty: 'id', rawData: {id: 12}});
            rs.add(newItem);
            collection.each(getColumnEach);
            assert.deepEqual(result, expected, 'wrong ColumnIndexes after adding one item');
        });
        it('add item at 0', () => {
            const expected = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0];
            const newItem = new Model({keyProperty: 'id', rawData: {id: 12}});
            rs.add(newItem, 0);
            collection.each(getColumnEach);
            assert.deepEqual(result, expected, 'wrong ColumnIndexes after adding one item');
        });
        it('add item at position', () => {
            const expected = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0];
            const newItem = new Model({keyProperty: 'id', rawData: {id: 12}});
            rs.add(newItem, 5);
            collection.each(getColumnEach);
            assert.deepEqual(result, expected, 'wrong ColumnIndexes after adding one item');
        });
    });
});
