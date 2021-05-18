import { assert } from 'chai';
import { GridDataRow, GridCollection } from 'Controls/grid';
import { Model } from 'Types/entity';

const rawData = { key: 1, firstStickyProperty: 'first', secondStickyProperty: 'second', caption: 'item_1' };
const columns = [{
    stickyProperty: ['firstStickyProperty', 'secondStickyProperty']
}, {
    displayProperty: 'caption'
}];

let multiSelectVisibility = 'hidden';

const mockedCollection = {
    getStickyColumnsCount: () => 2,
    hasMultiSelectColumn: () => multiSelectVisibility === 'visible',
    hasItemActionsSeparatedCell: () => false,
    getColumnsConfig: () => columns,
    getIndex: () => 0,
    notifyItemChange: () => {},
    getItemEditorTemplate: () => {},
    hasColumnScroll: () => false,
    isFullGridSupport: () => true
} as GridCollection<Model>;

describe('Controls/grid_clean/Display/DataRow', () => {
    let record: Model;

    beforeEach(() => {
        record = new Model({
            rawData: rawData,
            keyProperty: 'key'
        });
    });

    afterEach(() => {
        record = undefined;
    });

    it('Generate columns.instanceId', () => {
        const gridRow = new GridDataRow({
            owner: mockedCollection,
            columns: [{
                displayProperty: 'key'
            }, {
                displayProperty: 'caption'
            }],
            contents: record
        });

        let columns = gridRow.getColumns();
        assert.strictEqual(columns.length, 2);
        assert.strictEqual(columns[0].getInstanceId(), '1_column_0');
        assert.strictEqual(columns[1].getInstanceId(), '1_column_1');

        const newRecord = new Model({
            rawData: rawData,
            keyProperty: 'key'
        });

        gridRow.setContents(newRecord);

        columns = gridRow.getColumns();
        assert.strictEqual(columns.length, 2);
        assert.strictEqual(columns[0].getInstanceId(), '1_column_0');
        assert.strictEqual(columns[1].getInstanceId(), '1_column_1');

        multiSelectVisibility = 'visible';
        gridRow.setMultiSelectVisibility('visible');

        columns = gridRow.getColumns();
        assert.strictEqual(columns.length, 3);
        assert.strictEqual(columns[0].getInstanceId(), '1_column_checkbox');
        assert.strictEqual(columns[1].getInstanceId(), '1_column_0');
        assert.strictEqual(columns[2].getInstanceId(), '1_column_1');

        multiSelectVisibility = 'hidden';
        gridRow.setMultiSelectVisibility('hidden');

        columns = gridRow.getColumns();
        assert.strictEqual(columns.length, 2);
        assert.strictEqual(columns[0].getInstanceId(), '1_column_0');
        assert.strictEqual(columns[1].getInstanceId(), '1_column_1');
    });

    it('Initialize with ladder', () => {
        const initialLadder = {
            ladder: {
                firstStickyProperty: {
                    ladderLength: 5
                },
                secondStickyProperty: {
                    ladderLength: 2
                }
            },
            stickyLadder: {
                firstStickyProperty: {
                    ladderLength: 5,
                    headingStyle: 'grid-row: span 5'
                },
                secondStickyProperty: {
                    ladderLength: 2,
                    headingStyle: 'grid-row: span 2'
                }
            }
        };

        const secondLadder = {
            ladder: {
                firstStickyProperty: {
                    ladderLength: 3
                },
                secondStickyProperty: {
                    ladderLength: 1
                }
            },
            stickyLadder: {
                firstStickyProperty: {
                    ladderLength: 3,
                    headingStyle: 'grid-row: span 3'
                },
                secondStickyProperty: {
                    ladderLength: 1,
                    headingStyle: 'grid-row: span 1'
                }
            }
        };

        const gridRow = new GridDataRow({
            owner: mockedCollection,
            columns,
            contents: record
        });

        gridRow.updateLadder(initialLadder.ladder, initialLadder.stickyLadder);

        let columnsItems = gridRow.getColumns();
        assert.strictEqual(columnsItems.length, 4);
        assert.strictEqual(gridRow.getVersion(), 0, 'The row version after initialize must be equals "0". No other variants!');

        gridRow.updateLadder(initialLadder.ladder, initialLadder.stickyLadder);
        columnsItems = gridRow.getColumns();
        assert.strictEqual(columnsItems.length, 4);
        assert.strictEqual(gridRow.getVersion(), 0, 'The row version after setLadder(currentLadder) must be equals "0". No other variants!');

        gridRow.updateLadder(secondLadder.ladder, secondLadder.stickyLadder);
        columnsItems = gridRow.getColumns();
        assert.strictEqual(columnsItems.length, 4);
        assert.strictEqual(gridRow.getVersion(), 1, 'The row version after setLadder(newLadder) must be equals "1". No other variants!');
    });

    it('Set editing of separated column', () => {
        const gridRow = new GridDataRow({
            owner: {
                ...mockedCollection,
                getEditingConfig: () => ({
                    mode: 'cell'
                })
            },
            columns: [{
                displayProperty: 'key'
            }, {
                displayProperty: 'caption'
            }],
            contents: record
        });

        gridRow.setEditing(true, gridRow.contents, false, 1);
        const columns = gridRow.getColumns();
        assert.isFalse(columns[0].isEditing());
        assert.isTrue(columns[1].isEditing());
    });

    it('editing with itemEditorTemplate', () => {
        const gridRow = new GridDataRow({
            owner: {
                ...mockedCollection,
                getEditingConfig: () => ({
                }),
                getItemEditorTemplate: () => 'ITEM_EDITOR_TEMPLATE'
            },
            columns: [{
                displayProperty: 'key'
            }, {
                displayProperty: 'caption'
            }],
            contents: record
        });

        gridRow.setEditing(true, gridRow.contents, false, 1);
        assert.equal(gridRow.getColumns().length, 1);
    });
});
