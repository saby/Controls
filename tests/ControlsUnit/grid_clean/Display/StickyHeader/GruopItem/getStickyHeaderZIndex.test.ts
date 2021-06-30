import { assert } from 'chai';
import { GridGroupRow as GridGroupItem } from 'Controls/grid';

const column = { displayProperty: 'col1' };
const GROUP_Z_INDEX_DEFAULT = 2;
const GROUP_Z_INDEX_WITHOUT_HEADERS_AND_RESULTS = 3;

describe('Controls/grid_clean/Display/StickyHeader/GroupItem/getStickyHeaderZIndex', () => {
    function getGroupItem({hasHeader, resultsPosition}) {
        return new GridGroupItem({
            owner: {
                getStickyColumnsCount: () => 0,
                hasMultiSelectColumn: () => false,
                getGridColumnsConfig: () => [column],
                hasItemActionsSeparatedCell: () => false,
                getLeftPadding: () => 's',
                getRightPadding: () => 's',
                isStickyHeader: () => true,
                hasColumnScroll: () => false,
                hasHeader: () => hasHeader,
                getResultsPosition: () => resultsPosition
            } as any
        });
    }
    it('getStickyHeaderZIndex with header and results', () => {
        const gridGroupItem = getGroupItem({hasHeader: true, resultsPosition: 'top'});
        const zIndex = gridGroupItem.getStickyHeaderZIndex();
        assert.strictEqual(zIndex, GROUP_Z_INDEX_DEFAULT);
    });
    it('getStickyHeaderZIndex with header', () => {
        const gridGroupItem = getGroupItem({hasHeader: true, resultsPosition: null});
        const zIndex = gridGroupItem.getStickyHeaderZIndex();
        assert.strictEqual(zIndex, GROUP_Z_INDEX_DEFAULT);
    });
    it('getStickyHeaderZIndex with results', () => {
        const gridGroupItem = getGroupItem({hasHeader: false, resultsPosition: 'top'});
        const zIndex = gridGroupItem.getStickyHeaderZIndex();
        assert.strictEqual(zIndex, GROUP_Z_INDEX_DEFAULT);
    });
    it('getStickyHeaderZIndex without header and results', () => {
        const gridGroupItem = getGroupItem({hasHeader: false, resultsPosition: null});
        const zIndex = gridGroupItem.getStickyHeaderZIndex();
        assert.strictEqual(zIndex, GROUP_Z_INDEX_WITHOUT_HEADERS_AND_RESULTS);
    });
});
