import { assert } from 'chai';

import TreeGridFooterRow from 'Controls/_treeGrid/display/TreeGridFooterRow';

const columns = [ { displayProperty: 'col1' }, { displayProperty: 'col2' }, { displayProperty: 'col3' } ];
const mockedOwner = {
    getGridColumnsConfig: () => columns,
    getStickyColumnsCount: () => 0,
    hasMultiSelectColumn: () => false,
    hasItemActionsSeparatedCell: () => true,
    isFullGridSupport: () => true,
    hasColumnScroll: () => false,
    isStickyFooter: () => false
} as any;

describe('Controls/treeGrid_clean/Display/ExpanderPadding/TreeGridFooterRow', () => {
    it('setDisplayExpanderPadding', () => {
        const footerRow = new TreeGridFooterRow({
            displayExpanderPadding: false,
            gridColumnsConfig: columns,
            owner: mockedOwner,
            columnsConfig: [
                { startColumn: 1, endColumn: 3 },
                { startColumn: 3, endColumn: 4 },
                { startColumn: 4, endColumn: 7 }
            ]
        });

        assert.isFalse(footerRow._$displayExpanderPadding);
        assert.isFalse(footerRow.getColumns()[0]._$displayExpanderPadding);

        footerRow.setDisplayExpanderPadding(true);
        assert.isTrue(footerRow._$displayExpanderPadding);
        assert.isTrue(footerRow.getColumns()[0]._$displayExpanderPadding);
    });

    it('setDisplayExpanderPadding when not created columns', () => {
        const footerRow = new TreeGridFooterRow({
            displayExpanderPadding: false,
            gridColumnsConfig: columns,
            owner: mockedOwner,
            columnsConfig: [
                { startColumn: 1, endColumn: 3 },
                { startColumn: 3, endColumn: 4 },
                { startColumn: 4, endColumn: 7 }
            ]
        });

        assert.doesNotThrow(footerRow.setDisplayExpanderPadding.bind(footerRow, true));
    });
});
