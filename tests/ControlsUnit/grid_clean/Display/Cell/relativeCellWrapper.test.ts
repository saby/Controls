import { Model } from 'Types/entity';
import { GridRow, GridCell } from 'Controls/grid';
import {assert} from 'chai';

describe('Controls/grid/Display/Cell/relativeCellWrapper', () => {
    let cell: GridCell<Model, GridRow<Model>>;
    let hoverBackgroundStyle: string;
    let owner;

    beforeEach(() => {
        owner = {
            getHoverBackgroundStyle: () => hoverBackgroundStyle,
            getTopPadding: () => 'default',
            getBottomPadding: () => 'default',
            getLeftPadding: () => 'default',
            getRightPadding: () => 'default',
            isDragged: () => false,
            getEditingBackgroundStyle: () => 'default',
            isActive: () => false,
            getRowSeparatorSize: () => 's',
            hasMultiSelectColumn: () => false,
            getColumnIndex: () => 1,

            // methods for contentClasses
            getColumnsCount: () => 1,
            getMultiSelectVisibility: () => 'hidden',
            hasItemActionsSeparatedCell: () => false,
            getStickyLadder: () => false,

            // owner methods for _getBackgroundColorWrapperClasses
            getEditingConfig: () => undefined,

            // This setting changes behavior
            isEditing: () => false,
            hasColumnScroll: () => false,
            isFullGridSupport: () => false
        } as undefined as GridRow<Model>;

        cell = null;
    });

    describe('.getRelativeCellWrapperStyles()', () => {
        beforeEach(() => {
            owner.hasColumnScroll = () => true;
        });

        describe('should set max width on fixed columns with column scroll', () => {
            it('fixed cell + px width', () => {
                cell = new GridCell({ owner, column: { width: '50px'}, isFixed: true });
                assert.equal(cell.getRelativeCellWrapperStyles(), 'max-width: 50px;');
            });

            it('fixed cell + non px width', () => {
                cell = new GridCell({ owner, column: { width: 'auto'}, isFixed: true });
                assert.equal(cell.getRelativeCellWrapperStyles(), '');
            });

            it('fixed cell + px compatibleWidth + non px width', () => {
                cell = new GridCell({ owner, column: { width: 'auto', compatibleWidth: '50px' }, isFixed: true });
                assert.equal(cell.getRelativeCellWrapperStyles(), 'max-width: 50px;');
            });

            it('fixed cell + non px compatibleWidth + non px width', () => {
                cell = new GridCell({ owner, column: { width: 'auto', compatibleWidth: 'auto' }, isFixed: true });
                assert.equal(cell.getRelativeCellWrapperStyles(), '');
            });

            it('scrollable cell + px width', () => {
                cell = new GridCell({ owner, column: { width: 'auto', compatibleWidth: 'auto' }, isFixed: false });
                assert.equal(cell.getRelativeCellWrapperStyles(), '');
            });

            it('grid has no column scroll', () => {
                owner.hasColumnScroll = () => false;
                cell = new GridCell({ owner, column: { width: '50px' }, isFixed: true });
                assert.equal(cell.getRelativeCellWrapperStyles(), '');
            });
        });
    });
});
