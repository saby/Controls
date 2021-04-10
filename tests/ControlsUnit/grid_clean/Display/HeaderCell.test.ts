import { assert } from 'chai';
import { GridHeaderCell } from 'Controls/grid';

describe('Controls/grid_clean/Display/HeaderCell', () => {
    describe('Controls/grid_clean/Display/HeaderCell/getColspanStyles', () => {
        it('checkbox cell', () => {
            const cell = new GridHeaderCell({
                column: {},
                owner: {
                    hasMultiSelectColumn: () => true,
                    getHeaderConfig: () => [{}, {}],
                    isFullGridSupport: () => true
                }
            });
            assert.equal(cell.getColspanStyles(), 'grid-column: 1 / 2;');
        });
    });
});
