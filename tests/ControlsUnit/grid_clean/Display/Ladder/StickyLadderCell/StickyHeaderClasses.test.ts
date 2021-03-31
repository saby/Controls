import { assert } from 'chai';
import { Model } from 'Types/entity';
import { GridStickyLadderCell } from 'Controls/gridNew';

const rawData = { key: 1, col1: 'c1-1', col2: 'с2-1', col3: 'с3-1' };
const column = { displayProperty: 'col1' };

describe('Controls/grid_clean/Display/Ladder/StickyLadderCell/StickyHeaderClasses', () => {
    let model: Model;

    beforeEach(() => {
        model = new Model({
            rawData,
            keyProperty: 'key'
        });
    });

    afterEach(() => {
        model = undefined;
    });

    it('getStickyHeaderClasses without header, results, stickyGroup', () => {
        let firstLadderLength = 0;
        const gridDataRow = new GridStickyLadderCell({
            owner: {
                getStickyLadder: () => { return { first: { ladderLength: firstLadderLength }, second: { ladderLength: 1 } } },
                getStickyLadderProperties: () => ['first', 'second'],
                hasHeader: () => false,
                getResultsPosition: () => '',
                hasStickyGroup: () => false
            } as any,
            column
        });
        assert.equal(gridDataRow.getStickyHeaderClasses(), ' controls-Grid__row-cell__ladder-spacing_theme-default');
        firstLadderLength = 1;
        assert.equal(gridDataRow.getStickyHeaderClasses(), '');
    });
    it('getStickyHeaderClasses with header, results, stickyGroup', () => {
        let firstLadderLength = 0;
        const gridDataRow = new GridStickyLadderCell({
            owner: {
                getStickyLadder: () => { return { first: { ladderLength: firstLadderLength }, second: { ladderLength: 1 } } },
                getStickyLadderProperties: () => ['first', 'second'],
                hasHeader: () => true,
                getResultsPosition: () => 'top',
                hasStickyGroup: () => true
            } as any,
            column
        });
        assert.equal(gridDataRow.getStickyHeaderClasses(), ' controls-Grid__row-cell__ladder-spacing_withHeader_withResults_withGroup_theme-default');
        firstLadderLength = 1;
        assert.equal(gridDataRow.getStickyHeaderClasses(), ' controls-Grid__row-cell__ladder-main_spacing_withGroup_theme-default');
    });
});
