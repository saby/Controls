import { assert } from 'chai';
import { GridFooterRow } from 'Controls/grid';

const columns = [ { displayProperty: 'col1' }, { displayProperty: 'col2' }, { displayProperty: 'col3' } ];
const mockedOwner = {
    getColumnsConfig: () => columns,
    getStickyColumnsCount: () => 0,
    hasMultiSelectColumn: () => false,
    hasItemActionsSeparatedCell: () => false,
    isFullGridSupport: () => true
} as any;

describe('Controls/grid_clean/Display/Footer/FooterRow/UpdateOption', () => {
    const firstFooterTemplate = () => 'FirstFooter';
    const secondFooterTemplate = () => 'SecondFooter';
    const firstFooterCellTemplate = () => 'FirstFooterCell';
    const secondFooterCellTemplate = () => 'SecondFooterCell';

    it('Initialize with footerTemplate', () => {
        const footerRow = new GridFooterRow({
            owner: mockedOwner,
            rowTemplate: firstFooterTemplate
        });

        assert.strictEqual(footerRow.getVersion(), 0);
        const footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 1);
        assert.strictEqual(footerColumns[0].getTemplate(), firstFooterTemplate);
    });

    it('Initialize with footer', () => {
        const footerRow = new GridFooterRow({
            owner: mockedOwner,
            columns: [
                { template: firstFooterCellTemplate },
                { template: secondFooterCellTemplate }
            ]
        });

        assert.strictEqual(footerRow.getVersion(), 0);
        const footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 2);
        assert.strictEqual(footerColumns[0].getTemplate(), firstFooterCellTemplate);
        assert.strictEqual(footerColumns[1].getTemplate(), secondFooterCellTemplate);
    });

    it('Initialize with footerTemplate and footer', () => {
        const footerRow = new GridFooterRow({
            owner: mockedOwner,
            rowTemplate: firstFooterTemplate,
            columns: [
                { template: firstFooterCellTemplate },
                { template: secondFooterCellTemplate }
            ]
        });

        assert.strictEqual(footerRow.getVersion(), 0);
        const footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 1);
        assert.strictEqual(footerColumns[0].getTemplate(), firstFooterTemplate);
    });

    it('Initialize with footerTemplate and setFooter', () => {
        const footerRow = new GridFooterRow({
            owner: mockedOwner,
            rowTemplate: firstFooterTemplate
        });

        let footerColumns = footerRow.getColumns();

        // set new "footerTemplate"
        footerRow.setFooter(secondFooterTemplate);
        assert.strictEqual(footerRow.getVersion(), 1);
        footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 1);
        assert.strictEqual(footerColumns[0].getTemplate(), secondFooterTemplate);

        // set new "footerTemplate" and "footer"
        const newColumns = [
            { template: firstFooterCellTemplate },
            { template: secondFooterCellTemplate }
        ];
        footerRow.setFooter(firstFooterTemplate, newColumns);
        assert.strictEqual(footerRow.getVersion(), 2);
        footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 1);
        assert.strictEqual(footerColumns[0].getTemplate(), firstFooterTemplate);

        // clear "footerTemplate"
        footerRow.setFooter(undefined, newColumns);
        assert.strictEqual(footerRow.getVersion(), 3);
        footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 2);
        assert.strictEqual(footerColumns[0].getTemplate(), firstFooterCellTemplate);
        assert.strictEqual(footerColumns[1].getTemplate(), secondFooterCellTemplate);
    });

    it('Initialize with footerTemplate and setColumns. Check colspan.', () => {
        const nextColumns = [ { displayProperty: 'col1' }, { displayProperty: 'col2' } ];

        const localMockedOwner = {
            getColumnsConfig: () => columns,
            getStickyColumnsCount: () => 0,
            hasMultiSelectColumn: () => false,
            hasItemActionsSeparatedCell: () => false,
            isFullGridSupport: () => true
        } as any;

        const footerRow = new GridFooterRow({
            owner: localMockedOwner,
            rowTemplate: firstFooterTemplate
        });

        let footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns[0].getColspan(), 3);

        localMockedOwner.getColumnsConfig = () => nextColumns;
        footerRow.setColumns(nextColumns);

        footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns[0].getColspan(), 2);
    });
});
