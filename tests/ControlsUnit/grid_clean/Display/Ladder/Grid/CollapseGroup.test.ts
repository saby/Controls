import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { GridCollection } from 'Controls/grid';

const rawData = [
    { key: 1, ladder: '1', group: '1', text: 'item-1' },
    { key: 2, ladder: '1', group: '1', text: 'item-2' },
    { key: 3, ladder: '2', group: '2', text: 'item-3' },
    { key: 4, ladder: '3', group: '2', text: 'item-4' }
];
const columns = [
    { displayProperty: 'text', stickyProperty: ['ladder'] }
];

describe('Controls/grid_clean/Display/Ladder/Grid/CollapseGroup' , () => {
    let collection: RecordSet;

    beforeEach(() => {
        collection = new RecordSet({
            rawData,
            keyProperty: 'key'
        });
    });

    afterEach(() => {
        collection = undefined;
    });
    it('should set ladder on correct items', () => {
        const expectedLadderItems = [
            {
                columns: [{constructorName: 'GroupCell'}]
            },
            {
                columns: [
                    { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 2' },
                    { constructorName: 'DataCell' }
                ]
            },
            {
                columns: [
                    { constructorName: 'DataCell' }
                ]
            },
            {
                columns: [{constructorName: 'GroupCell'}]
            },
            {
                columns: [
                    { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 1' },
                    { constructorName: 'DataCell' }
                ]
            },
            {
                columns: [
                    { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 1' },
                    { constructorName: 'DataCell' }
                ]
            }
        ];
        const expectedLaddersItemsAfterCollapseGroup = [
            {
                columns: [{constructorName: 'GroupCell'}]
            },
            {
                columns: [{constructorName: 'GroupCell'}]
            },
            {
                columns: [
                    { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 1' },
                    { constructorName: 'DataCell' }
                ]
            },
            {
                columns: [
                    { constructorName: 'StickyLadderCell', wrapperStyles: 'grid-row: span 1' },
                    { constructorName: 'DataCell' }
                ]
            }
        ];

        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            groupProperty: 'group',
            ladderProperties: ['ladder']
        });
        checkCollectionItems(gridCollection, expectedLadderItems);
        gridCollection.setCollapsedGroups(['1']);
        checkCollectionItems(gridCollection, expectedLaddersItemsAfterCollapseGroup);
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