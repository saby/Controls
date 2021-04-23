import { assert } from 'chai';
import TreeGridNodeFooterCell from 'Controls/_treeGrid/display/TreeGridNodeFooterCell';

describe('Controls/_treeGrid/display/TreeGridNodeFooterCell', () => {
    let mockedOwner;

    beforeEach(() => {
        mockedOwner = {
            getHoverBackgroundStyle: () => 'default',
            isDragged: () => false,
            hasItemActionsSeparatedCell: () => false,
            getTopPadding: () => 'default',
            getBottomPadding: () => 'default',
            getLeftPadding: () => 'default',
            getRightPadding: () => 'default',
            getEditingConfig: () => ({
                mode: 'cell'
            }),
            getColumnIndex: () => 0,
            getColumnsCount: () => 1,
            getMultiSelectVisibility: () => 'hidden',
            getColumnsConfig: () => [1],
            getStickyColumnsCount: () => 0,
            hasMultiSelectColumn: () => false,
            isFullGridSupport: () => false,
            isSupportStickyLadder: () => false,
            hasColumnScroll: () => false
        };
    });

    describe('getColspanStyles', () => {
        it('default', () => {
            const cell = new TreeGridNodeFooterCell({owner: mockedOwner});
            assert.equal(cell.getColspanStyles(), 'grid-column: 1 / 2');
        });

        it('has multiSelect', () => {
            mockedOwner.hasMultiSelectColumn = () => true;
            mockedOwner.getColumnsConfig = () => [1, 2];
            const cell = new TreeGridNodeFooterCell({owner: mockedOwner});
            assert.equal(cell.getColspanStyles(), 'grid-column: 2 / 4');
        });

        it('hasItemActionsSeparatedCell', () => {
            mockedOwner.hasItemActionsSeparatedCell = () => true;
            mockedOwner.getColumnsConfig = () => [1];
            const cell = new TreeGridNodeFooterCell({owner: mockedOwner});
            assert.equal(cell.getColspanStyles(), 'grid-column: 1 / 3');
        });

        it('hasMultiSelectColumn && hasItemActionsSeparatedCell', () => {
            mockedOwner.hasMultiSelectColumn = () => true;
            mockedOwner.hasItemActionsSeparatedCell = () => true;
            mockedOwner.getColumnsConfig = () => [1, 2];
            const cell = new TreeGridNodeFooterCell({owner: mockedOwner});
            assert.equal(cell.getColspanStyles(), 'grid-column: 2 / 5');
        });

        it('has sticky columns', () => {
            mockedOwner.getColumnsConfig = () => [1];
            mockedOwner.getStickyColumnsCount = () => 1;
            mockedOwner.isFullGridSupport = () => true;
            const cell = new TreeGridNodeFooterCell({owner: mockedOwner});
            assert.equal(cell.getColspanStyles(), 'grid-column: 1 / 2');
        });

        it('has ladder in first column', () => {
            mockedOwner.getColumnsConfig = () => [1];
            mockedOwner.getStickyColumnsCount = () => 1;
            mockedOwner.isFullGridSupport = () => true;
            mockedOwner.isSupportStickyLadder = () => true;
            const cell = new TreeGridNodeFooterCell({owner: mockedOwner});
            assert.equal(cell.getColspanStyles(), 'grid-column: 2 / 3');
        });
    });
});
