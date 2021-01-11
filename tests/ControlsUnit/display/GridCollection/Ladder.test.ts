import { assert } from 'chai';
import { GridCollection, VirtualScrollController } from 'Controls/display';
import { RecordSet } from 'Types/collection';

const keyProperty = 'key';

const displayProperties = ['first', 'second', 'third'];

const ladderProperties = ['firstSticky', 'secondSticky'];

const columns_count2 = [{
    displayProperty: displayProperties[0],
    stickyProperty: ladderProperties,
    width: '100px'
}, {
    displayProperty: displayProperties[1],
    width: '200px'
}];

const columns_count3 = [{
    displayProperty: displayProperties[0],
    stickyProperty: ladderProperties,
    width: '100px'
}, {
    displayProperty: displayProperties[1],
    width: '200px'
}, {
    displayProperty: displayProperties[2],
    width: '300px'
}];

function generateStickyLadderData(itemsCount: number): object[] {
    const data = [];
    for (let i = 0; i < itemsCount; i++) {
        const item = {};
        item[keyProperty] = i;
        item[ladderProperties[0]] = Math.floor(i / 5);
        item[ladderProperties[1]] = Math.floor(i / 2);
        displayProperties.forEach((property) => {
            item[property] = `${property} ${i}`;
        });
        data.push(item);
    }
    return data;
}

describe('Controls/display/GridCollection/StickyLadder', () => {
    describe('Without multiSelect', () => {
        const itemsCount = 10;
        let rs: RecordSet;

        beforeEach(() => {
            rs = new RecordSet({
                rawData: generateStickyLadderData(itemsCount),
                keyProperty: 'key'
            });
        });

        afterEach(() => {
            rs = undefined;
        });

        it('Initialize', () => {
            // initialize test result
            const resultItems = result_items10_columns2_withoutMultiSelect;

            // initialize collection
            const collection = new GridCollection({
                collection: rs,
                keyProperty,
                columns: columns_count2,
                ladderProperties
            });
            VirtualScrollController.setup(collection as unknown as VirtualScrollController.IVirtualScrollCollection);
            collection.setIndexes(0, itemsCount);

            // test
            try {
                checkCollectionItems(collection, resultItems);
            } catch (error) {
                throw error;
            }
        });

        it('Indexes changed to 0..5', () => {
            // initialize test result
            const resultItems = result_items5_columns2_withoutMultiSelect;

            // initialize collection
            const collection = new GridCollection({
                collection: rs,
                keyProperty,
                columns: columns_count2,
                ladderProperties
            });
            VirtualScrollController.setup(collection as unknown as VirtualScrollController.IVirtualScrollCollection);
            collection.setIndexes(0, 5);

            // test
            try {
                checkCollectionItems(collection, resultItems);
            } catch (error) {
                throw error;
            }
        });

        it('Columns count changed from 2 to 3', () => {
            // initialize test result
            const resultItems = result_items10_columns3_withoutMultiSelect;

            // initialize collection
            const collection = new GridCollection({
                collection: rs,
                keyProperty,
                columns: columns_count2,
                ladderProperties
            });
            VirtualScrollController.setup(collection as unknown as VirtualScrollController.IVirtualScrollCollection);
            collection.setIndexes(0, itemsCount);
            collection.setColumns(columns_count3);

            // test
            try {
                checkCollectionItems(collection, resultItems);
            } catch (error) {
                throw error;
            }
        });

        it('Indexes sets to 0..5. Set multiSelectVisibility to "visible"', () => {
            // initialize test result
            const resultItems = result_items5_columns2_withMultiSelect;

            // initialize collection
            const collection = new GridCollection({
                collection: rs,
                keyProperty,
                columns: columns_count2,
                ladderProperties
            });
            VirtualScrollController.setup(collection as unknown as VirtualScrollController.IVirtualScrollCollection);
            collection.setIndexes(0, 5);
            collection.setMultiSelectVisibility('visible');

            // test
            try {
                checkCollectionItems(collection, resultItems);
            } catch (error) {
                throw error;
            }
        });

        it('Indexes sets to 0..10. Index changed to 0..5. Set multiSelectVisibility to "visible". Remove item with index=2.', () => {
            // initialize test result
            const resultItems = result_items5_columns2_withMultiSelect_afterRemoveItem;

            // initialize collection
            const collection = new GridCollection({
                collection: rs,
                keyProperty,
                columns: columns_count2,
                ladderProperties
            });
            VirtualScrollController.setup(collection as unknown as VirtualScrollController.IVirtualScrollCollection);
            collection.setIndexes(0, itemsCount);
            collection.setIndexes(0, 5);
            collection.setMultiSelectVisibility('visible');
            rs.removeAt(2);

            // test
            try {
                checkCollectionItems(collection, resultItems);
            } catch (error) {
                throw error;
            }
        });
    });
});

function checkCollectionItems(collection: GridCollection<any>, resultItems: any[]) {
    const expectedItemsCount = resultItems.length;
    let itemsCount = 0;

    // check items columns
    collection.getViewIterator().each((item, index) => {
        itemsCount++;
        const resultItem = resultItems[index];
        const itemColumns = item.getColumns();

        // check columns count
        try {
            assert.strictEqual(itemColumns.length, resultItem.columns.length);
        } catch (originalError) {
            throw new Error(originalError + `. itemIndex: ${index}`);
        }

        // check columns instances
        itemColumns.forEach((column, columnIndex) => {
            const resultColumn = resultItem.columns[columnIndex];
            try {
                assert.strictEqual(column.constructor.name, resultColumn.constructorName);
                if (resultColumn.hasOwnProperty('wrapperStyles')) {
                    assert.strictEqual(column.getWrapperStyles(), resultColumn.wrapperStyles);
                }
            } catch (originalError) {
                throw new Error(originalError + `. itemIndex: ${index}, columnIndex: ${columnIndex}`);
            }
        });
    })

    // check items count
    assert.strictEqual(itemsCount, expectedItemsCount);
}

const result_items10_columns2_withoutMultiSelect = [{
    columns: [
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 5' },
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 5' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}];

const result_items5_columns2_withoutMultiSelect = [{
    columns: [
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 5' },
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 1' },
        { constructorName: 'DataCell' }]
}];

const result_items5_columns2_withMultiSelect = [{
    columns: [
        { constructorName: 'CheckboxCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 5' },
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'CheckboxCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'CheckboxCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'CheckboxCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'CheckboxCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 1' },
        { constructorName: 'DataCell' }]
}];

const result_items5_columns2_withMultiSelect_afterRemoveItem = [{
    columns: [
        { constructorName: 'CheckboxCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 4' },
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'CheckboxCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'CheckboxCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 1' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'CheckboxCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' }]
},  {
    columns: [
        { constructorName: 'CheckboxCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 1' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}];

const result_items10_columns3_withoutMultiSelect = [{
    columns: [
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 5' },
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 5' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}, {
    columns: [
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' },
        { constructorName: 'DataCell' }]
}];
