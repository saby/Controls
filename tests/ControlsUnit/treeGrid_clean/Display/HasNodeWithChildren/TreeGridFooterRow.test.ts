import { assert } from 'chai';

import TreeGridFooterRow from 'Controls/_treeGrid/display/TreeGridFooterRow';

const columns = [ { displayProperty: 'col1' }, { displayProperty: 'col2' }, { displayProperty: 'col3' } ];
const mockedOwner = {
    getColumnsConfig: () => columns,
    getStickyColumnsCount: () => 0,
    hasMultiSelectColumn: () => false,
    hasItemActionsSeparatedCell: () => true,
    isFullGridSupport: () => true,
    hasColumnScroll: () => false
} as any;

describe('Controls/treeGrid_clean/Display/HasNodeWithChildren/TreeGridFooterRow', () => {
    it('setHasNodeWithChildren', () => {
        const footerRow = new TreeGridFooterRow({
            hasNodeWithChildren: false,
            columns,
            owner: mockedOwner,
            footer: [
                { startColumn: 1, endColumn: 3 },
                { startColumn: 3, endColumn: 4 },
                { startColumn: 4, endColumn: 7 }
            ]
        });

        assert.isFalse(footerRow._$hasNodeWithChildren);
        assert.isFalse(footerRow.getColumns()[0]._$hasNodeWithChildren);

        footerRow.setHasNodeWithChildren(true);
        assert.isTrue(footerRow._$hasNodeWithChildren);
        assert.isTrue(footerRow.getColumns()[0]._$hasNodeWithChildren);
    });

    it('setHasNodeWithChildren when not created columns', () => {
        const footerRow = new TreeGridFooterRow({
            hasNodeWithChildren: false,
            columns,
            owner: mockedOwner,
            footer: [
                { startColumn: 1, endColumn: 3 },
                { startColumn: 3, endColumn: 4 },
                { startColumn: 4, endColumn: 7 }
            ]
        });

        assert.doesNotThrow(footerRow.setHasNodeWithChildren.bind(footerRow, true));
    });
});
