import { assert } from 'chai';
import { GridHeaderCell } from 'Controls/display';

describe('Controls/display:HeaderCell', () => {

    describe('align and valign', () => {

        it('should use values from header if it exist', () => {
            const headerColumnConfig = {
                align: 'right',
                valign: 'bottom'
            };
            const cell = new GridHeaderCell({
                owner: {
                    getColumnsConfig: () => [{}],
                    getHeaderConfig: () => [headerColumnConfig],
                    needMultiSelectColumn: () => false
                },
                column: headerColumnConfig,
            });
            assert.equal('right', cell.getAlign());
            assert.equal('bottom', cell.getVAlign());
        });

        it('should use values from columns if values on header not exist', () => {
            const headerColumnConfig = {};
            const cell = new GridHeaderCell({
                owner: {
                    getColumnsConfig: () => [{
                        align: 'right',
                        valign: 'bottom'
                    }],
                    getHeaderConfig: () => [headerColumnConfig],
                    needMultiSelectColumn: () => false
                },
                column: headerColumnConfig,
            });
            assert.equal('right', cell.getAlign());
            assert.equal('bottom', cell.getVAlign());
        });

        it('should set valign center on row spanned cell if value on cell config not exists', () => {
            const headerColumnConfig = {
                startRow: 1,
                endRow: 3
            };
            const cell = new GridHeaderCell({
                owner: {
                    getColumnsConfig: () => [{
                        align: 'right',
                        valign: 'bottom'
                    }],
                    getHeaderConfig: () => [headerColumnConfig],
                    needMultiSelectColumn: () => false
                },
                column: headerColumnConfig,
            });
            assert.equal('right', cell.getAlign());
            assert.equal('center', cell.getVAlign());
        });

        it('should set align center on colspanned cell if value on cell config not exists', () => {
            const headerColumnConfig = {
                startColumn: 1,
                endColumn: 3
            };
            const cell = new GridHeaderCell({
                owner: {
                    getColumnsConfig: () => [{
                        align: 'right',
                        valign: 'bottom'
                    }],
                    getHeaderConfig: () => [headerColumnConfig],
                    needMultiSelectColumn: () => false
                },
                column: headerColumnConfig,
            });
            assert.equal('center', cell.getAlign());
            assert.equal('bottom', cell.getVAlign());
        });
    });

});
