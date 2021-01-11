import { assert } from 'chai';
import { GridCollection } from 'Controls/display';
import { RecordSet } from 'Types/collection';

const rawData = [
    {
        key: 1,
        col1: 'c1-1',
        col2: 'с2-1',
        col3: 'с3-1'
    },
    {
        key: 2,
        col1: 'c1-2',
        col2: 'с2-2',
        col3: 'с3-2'
    }
];

const columns = [
    { displayProperty: 'col1', resultsTemplate: 'mockResultsTemplate1' },
    { displayProperty: 'col2', resultsTemplate: 'mockResultsTemplate2' },
    { displayProperty: 'col3', resultsTemplate: 'mockResultsTemplate3' },
];

describe('Controls/grid_clean/Display/ResultsColspan', () => {
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

    it('Initialize without resultsColspanCallback', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden',
            resultsPosition: 'top'
        });

        let columnItems = gridCollection.getResults().getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');
    });

    it('Initialize with resultsColspanCallback = () => "end"', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden',
            resultsPosition: 'top',
            resultsColspanCallback: () => 'end'
        });

        let columnItems = gridCollection.getResults().getColumns();
        assert.strictEqual(columnItems.length, 1);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 4;');
    });

    it('Initialize with resultsColspanCallback = (column, columnIndex) => columnIndex === 1 ? "end" : undefined ', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden',
            resultsPosition: 'top',
            resultsColspanCallback: (column, columnIndex) => columnIndex === 1 ? 'end' : undefined
        });

        let columnItems = gridCollection.getResults().getColumns();
        assert.strictEqual(columnItems.length, 2);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), 'grid-column: 2 / 4;');
    });

    it('Initialize with resultsColspanCallback = (column, columnIndex) => columnIndex === 2 ? "end" : undefined ', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden',
            resultsPosition: 'top',
            resultsColspanCallback: (column, columnIndex) => columnIndex === 2 ? 'end' : undefined
        });

        let columnItems = gridCollection.getResults().getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');
    });

    it('Initialize with resultsColspanCallback and reset callback', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden',
            resultsPosition: 'top',
            resultsColspanCallback: () => 'end'
        });

        // initialize
        let columnItems = gridCollection.getResults().getColumns();
        assert.strictEqual(columnItems.length, 1);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 4;');

        // reset callback
        gridCollection.setResultsColspanCallback(undefined);
        columnItems = gridCollection.getResults().getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');
    });

    it('Initialize without resultsColspanCallback and set callback', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            multiSelectVisibility: 'hidden',
            resultsPosition: 'top'
        });

        // initialize
        let columnItems = gridCollection.getResults().getColumns();
        assert.strictEqual(columnItems.length, 3);
        assert.strictEqual(columnItems[0].getColspan(), '');
        assert.strictEqual(columnItems[1].getColspan(), '');
        assert.strictEqual(columnItems[2].getColspan(), '');

        // reset callback
        gridCollection.setResultsColspanCallback((column, columnIndex) => columnIndex === 0 ? 2 : undefined);
        columnItems = gridCollection.getResults().getColumns();
        assert.strictEqual(columnItems.length, 2);
        assert.strictEqual(columnItems[0].getColspan(), 'grid-column: 1 / 3;');
        assert.strictEqual(columnItems[1].getColspan(), '');
    });
});
