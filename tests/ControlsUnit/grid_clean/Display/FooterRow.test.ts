import {GridFooterRow} from 'Controls/grid';
import {assert} from 'chai';

describe('Controls/grid_clean/Display/FooterRow', () => {
    it('should not skip columns for colspan. All 3 colspaned columns in footer should be shown.', () => {
        const gridColumnsConfig = [{}, {}, {}, {}, {}];
        const mockedCollection = {
            getGridColumnsConfig: () => gridColumnsConfig,
            hasColumnScroll: () => false,
            isFullGridSupport: () => true,
            hasMultiSelectColumn: () => false,
            hasItemActionsSeparatedCell: () => false,
            isStickyFooter: () => false
        };

        const footerColumnsConfig = [{ startColumn: 1, endColumn: 3 }, { startColumn: 3, endColumn: 5 }, { startColumn: 5, endColumn: 6 }];
        const footerRow = new GridFooterRow({
            owner: mockedCollection,
            columnsConfig: footerColumnsConfig,
            gridColumnsConfig: gridColumnsConfig
        });

        assert.equal(footerRow.getColumns().length, 3);
        assert.equal(footerRow.getColumns()[0].getColumnConfig(), footerColumnsConfig[0]);
        assert.equal(footerRow.getColumns()[1].getColumnConfig(), footerColumnsConfig[1]);
        assert.equal(footerRow.getColumns()[2].getColumnConfig(), footerColumnsConfig[2]);

        footerRow.setColumnsConfig([{ startColumn: 1, endColumn: 6 }]);
        assert.equal(footerRow.getColumns().length, 1);
    });
});
