import { assert } from 'chai';
import * as sinon from 'sinon';
import { Model } from 'Types/entity';
import { GridDataRow } from 'Controls/grid';

const TEST_SEARCH_VALUE = 'test';
const rawData = { key: 1, col1: 'c1-1', col2: 'с2-1', col3: 'с3-1' };
const columns = [
    { displayProperty: 'col1' },
    { displayProperty: 'col2' },
    { displayProperty: 'col3' }
];

describe('Controls/grid_clean/Display/SearchValue/DataRow/UpdateOption', () => {
    let model: Model;

    beforeEach(() => {
        model = new Model({
            rawData,
            keyProperty: 'key'
        });
    });

    afterEach(() => {
        model = undefined;
    });

    it('Initialize without searchValue and set searchValue', () => {
        const gridDataRow = new GridDataRow({
            contents: model,
            owner: {} as any,
            columns
        });

        assert.isEmpty(gridDataRow.getSearchValue());
        assert.strictEqual(gridDataRow.getVersion(), 0);

        gridDataRow.setSearchValue(TEST_SEARCH_VALUE);

        assert.strictEqual(gridDataRow.getSearchValue(), TEST_SEARCH_VALUE);
        assert.strictEqual(gridDataRow.getVersion(), 1);
    });

    it('Initialize without searchValue and set searchValue - check setSearchValue for columns', () => {
        const gridDataRow = new GridDataRow({
            contents: model,
            owner: {
                getStickyColumnsCount: () => 0,
                getColumnsConfig: () => columns,
                hasMultiSelectColumn: () => false,
                hasItemActionsSeparatedCell: () => false,
                getItemEditorTemplate: () => {},
                isFullGridSupport: () => true,
                hasColumnScroll: () => false
            } as any,
            columns
        });

        const sandbox = sinon.createSandbox();
        let columnItems = gridDataRow.getColumns();
        columnItems.forEach((column) => {
            sandbox.spy(column, 'setSearchValue');
        });

        gridDataRow.setSearchValue(TEST_SEARCH_VALUE);

        gridDataRow.getColumns().forEach((column) => {
            assert(column.setSearchValue.calledOnce);
            assert.strictEqual(column.setSearchValue.getCall(0).args[0], TEST_SEARCH_VALUE);
        });

        sandbox.restore();
    });

    it('Initialize with multiSelectVisibility="visible", without searchValue and set searchValue', () => {
        const gridDataRow = new GridDataRow({
            contents: model,
            multiSelectVisibility: 'visible',
            owner: {
                getStickyColumnsCount: () => 0,
                getColumnsConfig: () => columns,
                hasMultiSelectColumn: () => true,
                hasItemActionsSeparatedCell: () => false,
                getItemEditorTemplate: () => {},
                isFullGridSupport: () => true,
                hasColumnScroll: () => false
            } as any,
            columns
        });

        const sandbox = sinon.createSandbox();
        let columnItems = gridDataRow.getColumns();
        columnItems.forEach((column) => {
            if (column.hasOwnProperty('setSearchValue')) {
                sandbox.spy(column, 'setSearchValue');
            }
        });

        gridDataRow.setSearchValue(TEST_SEARCH_VALUE);

        gridDataRow.getColumns().forEach((column) => {
            if (column.hasOwnProperty('setSearchValue')) {
                assert(column.setSearchValue.calledOnce);
                assert.strictEqual(column.setSearchValue.getCall(0).args[0], TEST_SEARCH_VALUE);
            }
        });

        sandbox.restore();
    });
});
