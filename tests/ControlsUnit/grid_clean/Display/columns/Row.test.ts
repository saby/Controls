import { assert } from 'chai';
import { GridDataRow, GridCollection } from 'Controls/grid';
import { Model } from 'Types/entity';

const mockedCollection = {
    getStickyColumnsCount: () => 0,
    hasMultiSelectColumn: () => false,
    hasItemActionsSeparatedCell: () => false,
    getIndex: () => 0,
    notifyItemChange: () => {},
    getItemEditorTemplate: () => {},
    isFullGridSupport: () => true,
    hasColumnScroll: () => false
} as GridCollection<Model>;

describe('Controls/grid_clean/Display/columns/Row', () => {
    let record: Model;

    beforeEach(() => {
        record = new Model({
            rawData: { key: 1, title: 'first'},
            keyProperty: 'key'
        });
    });

    afterEach(() => {
        record = undefined;
    });

    describe('.setColumnsConfig()', () => {
        it('[DATA] => [DATA]', () => {
            const columnsConfig = [{displayProperty: 'before'}];
            const gridRow = new GridDataRow({
                owner: {
                    ...mockedCollection,
                    getGridColumnsConfig: () => columnsConfig
                },
                columnsConfig: columnsConfig,
                gridColumnsConfig: columnsConfig,
                contents: record
            });

            assert.isArray(gridRow.getColumns());
            assert.equal(gridRow.getColumns().length, 1);
            assert.deepEqual(gridRow.getColumns()[0].getColumnConfig(), {displayProperty: 'before'});
            assert.equal(gridRow.getVersion(), 0);

            // Устанавливаем новые колонки
            gridRow.setColumnsConfig([{displayProperty: 'after'}]);

            assert.isArray(gridRow.getColumns());
            assert.equal(gridRow.getColumns().length, 1);
            assert.deepEqual(gridRow.getColumns()[0].getColumnConfig(), {displayProperty: 'after'});
            assert.equal(gridRow.getVersion(), 1);
        });

        it('[NULL] => [DATA]', () => {
            const columnsConfig = [{displayProperty: 'before'}];
            const gridRow = new GridDataRow({
                owner: {
                    ...mockedCollection,
                    getGridColumnsConfig: () => columnsConfig
                },
                gridColumnsConfig: columnsConfig,
                columnsConfig: columnsConfig,
                contents: record
            });

            gridRow.setColumnsConfig(null);
            assert.equal(gridRow.getVersion(), 1);
            assert.isUndefined(gridRow.getColumns());

            // Устанавливаем новые колонки
            gridRow.setColumnsConfig([{displayProperty: 'after'}]);

            assert.equal(gridRow.getVersion(), 2);
            assert.equal(gridRow.getColumns().length, 1);
        });

        it('[DATA] => [NULL]', () => {
            const columnsConfig = [{displayProperty: 'before'}];
            const gridRow = new GridDataRow({
                owner: {
                    ...mockedCollection,
                    getGridColumnsConfig: () => columnsConfig
                },
                columnsConfig: columnsConfig,
                gridColumnsConfig: columnsConfig,
                contents: record
            });

            assert.isArray(gridRow.getColumns());
            assert.equal(gridRow.getColumns().length, 1);
            assert.deepEqual(gridRow.getColumns()[0].getColumnConfig(), {displayProperty: 'before'});
            assert.equal(gridRow.getVersion(), 0);

            // Устанавливаем новые колонки
            gridRow.setColumnsConfig(null);

            assert.equal(gridRow.getVersion(), 1);
            assert.isNull(gridRow.getColumns());
        });
    });
});
