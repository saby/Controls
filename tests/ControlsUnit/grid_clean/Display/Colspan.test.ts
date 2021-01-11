import { assert } from 'chai';
import { GridCollection } from 'Controls/display';
import { RecordSet } from 'Types/collection';
import { TColspanCallbackResult } from 'Controls/display';

const rawData = [
    {
        key: 1,
        col1: 'c1-1',
        col2: 'с2-1',
        col3: 'с3-1',
    },
    {
        key: 2,
        col1: 'c1-2',
        col2: 'с2-2',
        col3: 'с3-2',
    },
    {
        key: 3,
        col1: 'c1-3',
        col2: 'с2-3',
        col3: 'с3-3',
    },
    {
        key: 4,
        col1: 'c1-4',
        col2: 'с2-4',
        col3: 'с3-4',
    }
];
const columns = [
    { displayProperty: 'col1' },
    { displayProperty: 'col2' },
    { displayProperty: 'col3' }
];

function colspanCallback(item, column, columnIndex, isEditing): TColspanCallbackResult {
    if (item.getKey() === 1) {
        if (isEditing) {
            return 3;
        } else {
            return;
        }
    }
    if (item.getKey() === 2) {
        if (columnIndex === 0) {
            return 2;
        } else {
            return;
        }
    }
    if (item.getKey() === 3) {
        if (columnIndex === 1) {
            return 2;
        }
    }
    if (item.getKey() === 4) {
        return 3;
    }
}

describe('Controls/grid_clean/Display/Colspan', () => {
    let collection: RecordSet;

    beforeEach(() => {
        collection = new RecordSet({
            rawData: rawData,
            keyProperty: 'key'
        });
    });

    afterEach(() => {
        collection = undefined;
    });

    it('Initialize without colspan', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden'
        });

        // first item
        let columnItems = gridCollection.at(0).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');

        // second item
        columnItems = gridCollection.at(1).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');

        // third item
        columnItems = gridCollection.at(2).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');

        // fourth item
        columnItems = gridCollection.at(3).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');
    });

    it('Initialize with colspan', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden',
            colspanCallback
        });

        // first item
        let columnItems = gridCollection.at(0).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');

        // second item
        columnItems = gridCollection.at(1).getColumns();
        assert.strictEqual(columnItems.length, 2);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 3;');
        assert.strictEqual(columnItems[1].getColspan(), '');

        // third item
        columnItems = gridCollection.at(2).getColumns();
        assert.strictEqual(columnItems.length, 2);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), 'grid-column: 2 / 4;');

        // fourth item
        columnItems = gridCollection.at(3).getColumns();
        assert.strictEqual(columnItems.length, 1);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 4;');

        // first item with editing
        gridCollection.at(0).setEditing(true)
        columnItems = gridCollection.at(0).getColumns();
        assert.strictEqual(columnItems.length, 1);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 4;');
    });

    it('Initialize with colspanCallback() => "end"', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden',
            colspanCallback: (item, column, columnIndex): TColspanCallbackResult => {
                if (item.getKey() === 1) {
                    if (columnIndex === 0) {
                        return 'end';
                    }
                }
                if (item.getKey() === 2) {
                    if (columnIndex === 1) {
                        return 'end';
                    }
                }
                if (item.getKey() === 3) {
                    if (columnIndex === 2) {
                        return 'end';
                    }
                }
            }
        });

        // first item
        let columnItems = gridCollection.at(0).getColumns();
        assert.strictEqual(columnItems.length, 1);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 4;');

        // second item
        columnItems = gridCollection.at(1).getColumns();
        assert.strictEqual(columnItems.length, 2);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), 'grid-column: 2 / 4;');

        // third item
        columnItems = gridCollection.at(2).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        // Attention! 'grid-column: 3 / 4;' - invalid result, expected ''.
        assert.strictEqual(columnItems[2].getColspan(), '');

        // fourth item
        columnItems = gridCollection.at(3).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');
    });

    it('Initialize with colspan and reset colspanCallback', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden',
            colspanCallback
        });

        gridCollection.setColspanCallback(undefined);

        // first item
        let columnItems = gridCollection.at(0).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');

        // second item
        columnItems = gridCollection.at(1).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');

        // third item
        columnItems = gridCollection.at(2).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');

        // fourth item
        columnItems = gridCollection.at(3).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');

        // first item with editing
        gridCollection.at(0).setEditing(true)
        columnItems = gridCollection.at(0).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');
    });

    it('Initialize with colspan and set another colspanCallback', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden',
            colspanCallback
        });

        gridCollection.setColspanCallback((item, column, columnIndex, isEditing): number => {
            return 3;
        });

        // first item
        let columnItems = gridCollection.at(0).getColumns();
        assert.strictEqual(columnItems.length, 1);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 4;');

        // second item
        columnItems = gridCollection.at(1).getColumns();
        assert.strictEqual(columnItems.length, 1);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 4;');

        // third item
        columnItems = gridCollection.at(2).getColumns();
        assert.strictEqual(columnItems.length, 1);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 4;');

        // fourth item
        columnItems = gridCollection.at(3).getColumns();
        assert.strictEqual(columnItems.length, 1);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 4;');

        // first item with editing
        gridCollection.at(0).setEditing(true)
        columnItems = gridCollection.at(0).getColumns();
        assert.strictEqual(columnItems.length, 1);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 4;');
    });

    it('Initialize with colspan and multiSelectVisibility === "visible"', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden',
            colspanCallback
        });

        gridCollection.setMultiSelectVisibility('visible');

        // first item
        let columnItems = gridCollection.at(0).getColumns();
        assert.strictEqual(columnItems.length, 4);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');
        assert.strictEqual(columnItems[3].getColspan(), '');

        // second item
        columnItems = gridCollection.at(1).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), 'grid-column: 2 / 4;');
        assert.strictEqual(columnItems[2].getColspan(), '');

        // third item
        columnItems = gridCollection.at(2).getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), 'grid-column: 3 / 5;');

        // fourth item
        columnItems = gridCollection.at(3).getColumns();
        assert.strictEqual(columnItems.length, 2);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), 'grid-column: 2 / 5;');

        // first item with editing
        gridCollection.at(0).setEditing(true)
        columnItems = gridCollection.at(0).getColumns();
        assert.strictEqual(columnItems.length, 2);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), 'grid-column: 2 / 5;');
    });
});
