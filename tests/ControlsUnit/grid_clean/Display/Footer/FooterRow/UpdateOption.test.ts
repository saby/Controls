import { assert } from 'chai';
import { GridFooterRow } from 'Controls/gridNew';

const columns = [ { displayProperty: 'col1' }, { displayProperty: 'col2' }, { displayProperty: 'col3' } ];
const mockedOwner = {
    getColumnsConfig: () => columns,
    getStickyColumnsCount: () => 0,
    hasMultiSelectColumn: () => false,
    hasItemActionsSeparatedCell: () => false
} as any;

describe('Controls/grid_clean/Display/Footer/FooterRow/UpdateOption', () => {
    const firstFooterTemplate = () => 'FirstFooter';
    const secondFooterTemplate = () => 'SecondFooter';
    const firstFooterCellTemplate = () => 'FirstFooterCell';
    const secondFooterCellTemplate = () => 'SecondFooterCell';

    it('Initialize with footerTemplate', () => {
        const footerRow = new GridFooterRow({
            columns,
            owner: mockedOwner,
            footerTemplate: firstFooterTemplate
        });

        assert.strictEqual(footerRow.getVersion(), 0);
        const footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 1);
        assert.strictEqual(footerColumns[0].getTemplate(), firstFooterTemplate);
    });

    it('Initialize with footer', () => {
        const footerRow = new GridFooterRow({
            columns,
            owner: mockedOwner,
            footer: [
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
            columns,
            owner: mockedOwner,
            footerTemplate: firstFooterTemplate,
            footer: [
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

    it('Initialize with footerTemplate and setFooter', () => {
        const footerRow = new GridFooterRow({
            columns,
            owner: mockedOwner,
            footerTemplate: firstFooterTemplate
        });

        let footerColumns = footerRow.getColumns();

        // set new "footerTemplate"
        footerRow.setFooter(secondFooterTemplate);
        assert.strictEqual(footerRow.getVersion(), 1);
        footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 1);
        assert.strictEqual(footerColumns[0].getTemplate(), secondFooterTemplate);

        // set new "footerTemplate" and "footer"
        footerRow.setFooter(firstFooterTemplate, [
            { template: firstFooterCellTemplate },
            { template: secondFooterCellTemplate }
        ]);
        assert.strictEqual(footerRow.getVersion(), 2);
        footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 2);
        assert.strictEqual(footerColumns[0].getTemplate(), firstFooterCellTemplate);
        assert.strictEqual(footerColumns[1].getTemplate(), secondFooterCellTemplate);
    });
});
