import { assert } from 'chai';
import { GridResultsCell } from 'Controls/grid';

const RESULTS_CELL_TEMPLATE = 'RESULTS_CELL_TEMPLATE';
const CELL_TEMPLATE = 'CELL_TEMPLATE';

describe('Controls/grid_clean/Display/Results/ResultsCell', () => {
    it('getTemplate(), isSingleCell = false', () => {
        const cell = new GridResultsCell({
            column: {
                template: CELL_TEMPLATE,
                resultTemplate: RESULTS_CELL_TEMPLATE
            },
            owner: {
                hasMultiSelectColumn: () => false,
                isFullGridSupport: () => true
            }
        });
        assert.equal(cell.getTemplate(), RESULTS_CELL_TEMPLATE);
    });

    it('getTemplate(), isSingleCell = true', () => {
        const cell = new GridResultsCell({
            column: {
                template: CELL_TEMPLATE,
                resultTemplate: RESULTS_CELL_TEMPLATE
            },
            owner: {
                hasMultiSelectColumn: () => false,
                isFullGridSupport: () => true
            },
            isSingleCell: true
        });
        assert.equal(cell.getTemplate(), RESULTS_CELL_TEMPLATE);
    });
});
