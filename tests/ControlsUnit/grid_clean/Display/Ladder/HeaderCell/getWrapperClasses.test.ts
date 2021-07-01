import { assert } from 'chai';
import { createRegExpForTestMatchClass } from 'ControlsUnit/_unitUtils/RegExp';
import { GridHeaderCell } from 'Controls/grid';

const column = { displayProperty: 'col1' };
const headerColumn = {};

describe('Controls/grid_clean/Display/Ladder/HeaderCell/getWrapperClasses', () => {
    it('ladderCell not contains padding classes', () => {
        const gridHeaderCell = new GridHeaderCell({
            owner: {
                hasMultiSelectColumn: () => false,
                getGridColumnsConfig: () => [column],
                getHeaderConfig: () => [headerColumn],
                getColumnIndex: () => 0,
                isMultiline: () => false,
                isStickyHeader: () => false,
                hasColumnScroll: () => false,
                getMultiSelectVisibility: () => 'hidden',
                getLeftPadding: () => 's',
                getRightPadding: () => 's',
                getColumnsCount: () => 1,
                hasItemActionsSeparatedCell: () => false
            } as any,
            column: headerColumn,
            isLadderCell: true
        });
        const cellWrapperClasses = gridHeaderCell.getWrapperClasses('TestTheme', 'TestBGStyle', 'TestStyle');
        assert.notMatch(cellWrapperClasses, createRegExpForTestMatchClass('controls-Grid__cell_spacingLeft'));
        assert.notMatch(cellWrapperClasses, createRegExpForTestMatchClass('controls-Grid__cell_spacingRight'));
        assert.notMatch(cellWrapperClasses, createRegExpForTestMatchClass('controls-Grid__cell_spacingFirstCol'));
        assert.notMatch(cellWrapperClasses, createRegExpForTestMatchClass('controls-Grid__cell_spacingLastCol'));
    });
});
