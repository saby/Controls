import { assert } from 'chai';
import * as sinon from 'sinon';
import { GridFooterRow, IGridFooterCellOptions } from 'Controls/gridNew';

const columns = [{}, {}, {}, {}, {}, {}];

describe('Controls/grid_clean/Display/Footer/FooterRow/Colspan', () => {

    it('Grid columns count > footer columns count', () => {
        const mockedOwner = {
            getColumnsConfig: () => columns,
            getStickyColumnsCount: () => 0,
            hasMultiSelectColumn: () => false,
            hasItemActionsSeparatedCell: () => false
        } as any;

        const footerRow = new GridFooterRow({
            columns,
            owner: mockedOwner,
            footer: [
                { startColumn: 1, endColumn: 3 },
                { startColumn: 3, endColumn: 4 },
                { startColumn: 4, endColumn: 7 },
            ]
        });
        const sandbox = sinon.createSandbox();

        // replace cell constructor to fake constructor for test options
        function FakeGridFooterCellFactory(options: IGridFooterCellOptions<any>) {
            assert.strictEqual(options.colspan, 0);
        }
        sandbox.replace(footerRow, 'getColumnsFactory', (): any => {
            return FakeGridFooterCellFactory;
        });

        const footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 3);

        sandbox.restore();
    });

    it('Grid columns count > footer columns count, [multiSelectVisibility = visible]', () => {
        const mockedOwner = {
            getColumnsConfig: () => columns,
            getStickyColumnsCount: () => 0,
            hasMultiSelectColumn: () => true,
            hasItemActionsSeparatedCell: () => false
        } as any;

        const footerRow = new GridFooterRow({
            columns,
            owner: mockedOwner,
            multiSelectVisibility: 'visible',
            footer: [
                { startColumn: 1, endColumn: 3 },
                { startColumn: 3, endColumn: 4 },
                { startColumn: 4, endColumn: 7 },
            ]
        });
        const sandbox = sinon.createSandbox();

        // replace cell constructor to fake constructor for test options
        function FakeGridFooterCellFactory(options: IGridFooterCellOptions<any>) {
            assert.strictEqual(options.colspan, 0);
        }
        sandbox.replace(footerRow, 'getColumnsFactory', (): any => {
            return FakeGridFooterCellFactory;
        });

        const footerColumns = footerRow.getColumns();
        assert.strictEqual(footerColumns.length, 4);

        sandbox.restore();
    });
});
