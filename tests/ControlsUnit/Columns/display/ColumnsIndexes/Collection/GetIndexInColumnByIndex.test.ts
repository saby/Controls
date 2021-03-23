import { ColumnsCollection } from 'Controls/columns';
import { RecordSet } from 'Types/collection';
import { assert } from 'chai';
import { Model } from 'Types/entity';

describe('Columns/display/ColumnsIndexes/Collection/GetIndexInColumnByIndex', () => {
    let rs;
    let collection;
    let result = [];

    const getIndexInColumnByIndexEach = (item, index) => {
        result.push(collection.getIndexInColumnByIndex(index));
    }

    beforeEach(() => {
        rs = new RecordSet({
            keyProperty: 'id',
            rawData: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((id) => {
                return {
                    id
                };
            })
        });
        collection = new ColumnsCollection({collection: rs, columnsCount: 3});
    });
    it('initial state check', () => {
        const expected = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
        result = [];
        collection.each(getIndexInColumnByIndexEach);
        assert.deepEqual(result, expected, 'wrong initial columnIndexes');
    });
    it('remove single item', () => {
        const expected = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3];
        rs.removeAt(0);
        result = [];
        collection.each(getIndexInColumnByIndexEach);
        assert.deepEqual(result, expected, 'wrong ColumnIndexes after removing one item');
    });
    it('remove several items', () => {
        const expected = [0, 0, 0, 1, 1, 1, 2, 2, 2];
        const itemsToRemove = [rs.at(0), rs.at(1), rs.at(2)];
        itemsToRemove.forEach((item) => {
            rs.remove(item);
        });
        result = [];
        collection.each(getIndexInColumnByIndexEach);
        assert.deepEqual(result, expected, 'wrong ColumnIndexes after removing several item');
    });
    it('remove from last column', () => {
        const expected = [0, 0, 1, 1, 2, 2, 3, 3];
        const itemsToRemove = [rs.at(2), rs.at(5), rs.at(8), rs.at(11)];
        itemsToRemove.forEach((item) => {
            rs.remove(item);
        });
        result = [];
        collection.each(getIndexInColumnByIndexEach);
        assert.deepEqual(result, expected, 'wrong ColumnIndexes after removing several item');
    });
    it('add item', () => {
        const expected = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4];
        const newItem = new Model({keyProperty: 'id', rawData: {id: 12}});
        rs.add(newItem);
        result = [];
        collection.each(getIndexInColumnByIndexEach);
        assert.deepEqual(result, expected, 'wrong ColumnIndexes after adding one item');
    });
});
