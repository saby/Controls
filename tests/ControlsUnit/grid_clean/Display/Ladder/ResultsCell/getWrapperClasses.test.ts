import { assert } from 'chai';
import { createRegExpForTestMatchClass } from 'ControlsUnit/_unitUtils/RegExp';
import { GridResultsCell } from 'Controls/grid';

const column = { displayProperty: 'col1' };
const resultsColumn = {};

describe('Controls/grid_clean/Display/Ladder/ResultsCell/getWrapperClasses', () => {
    it('ladderCell not contains padding classes', () => {
        const gridResultsCell = new GridResultsCell({
            owner: {
                hasMultiSelectColumn: () => false,
                getGridColumnsConfig: () => [column],
                getHeaderConfig: () => [resultsColumn],
                getColumnIndex: () => 0,
                isStickyHeader: () => false,
                isSticked: () => false,
                hasColumnScroll: () => false,
                getMultiSelectVisibility: () => 'hidden',
                getLeftPadding: () => 's',
                getRightPadding: () => 's',
                getColumnsCount: () => 1,
                hasItemActionsSeparatedCell: () => false
            } as any,
            column: resultsColumn,
            isLadderCell: true
        });
        const cellWrapperClasses = gridResultsCell.getWrapperClasses('TestTheme', 'TestBGStyle', 'TestStyle', false);
        assert.notMatch(cellWrapperClasses, createRegExpForTestMatchClass('controls-Grid__cell_spacingLeft'));
        assert.notMatch(cellWrapperClasses, createRegExpForTestMatchClass('controls-Grid__cell_spacingRight'));
        assert.notMatch(cellWrapperClasses, createRegExpForTestMatchClass('controls-Grid__cell_spacingFirstCol'));
        assert.notMatch(cellWrapperClasses, createRegExpForTestMatchClass('controls-Grid__cell_spacingLastCol'));
    });
});
