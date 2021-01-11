import { assert } from 'chai';

import { GridCell, GridCollection, GridRow } from 'Controls/display';
import { Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';

describe('Controls/_display/EmptyRow', () => {

    let collection: RecordSet;
    let gridCollection: GridCollection;

    beforeEach(() => {
        collection = new RecordSet({
            rawData: [],
            keyProperty: 'key'
        });
    });

    it('one colspan cell', () => {
        gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns: [{}, {}, {}],
            multiSelectVisibility: 'hidden',
            emptyTemplate: () => {/*template function*/}
        });
        assert.isDefined(gridCollection.getEmptyGridRow());
        assert.equal(gridCollection.getEmptyGridRow().getColumns().length, 1);
    });

    it('separated columns', () => {
        gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns: [{}, {}, {}],
            multiSelectVisibility: 'hidden',
            emptyTemplateColumns: [{ startColumn: 1, endColumn: 2}, { startColumn: 2, endColumn: 4}]
        });
        assert.isDefined(gridCollection.getEmptyGridRow());
        assert.equal(gridCollection.getEmptyGridRow().getColumns().length, 2);

        const column = gridCollection.getEmptyGridRow().getColumns()[1];
        assert.equal(column._$colspan, 2);
    });
});
