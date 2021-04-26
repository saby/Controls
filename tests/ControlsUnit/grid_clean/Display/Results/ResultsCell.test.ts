import { assert } from 'chai';
import { GridResultsCell, GRID_RESULTS_CELL_DEFAULT_TEMPLATE } from 'Controls/grid';

const RESULTS_CELL_TEMPLATE = 'RESULTS_CELL_TEMPLATE';
const CELL_TEMPLATE = 'CELL_TEMPLATE';

describe('Controls/grid_clean/Display/Results/ResultsCell', () => {
    it('getTemplate(), isSingleColspanedCell = false', () => {
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

    it('getTemplate(), isSingleColspanedCell = false, without resultTemplate', () => {
        const cell = new GridResultsCell({
            column: {
                template: CELL_TEMPLATE
            },
            owner: {
                hasMultiSelectColumn: () => false,
                isFullGridSupport: () => true
            }
        });
        assert.equal(cell.getTemplate(), GRID_RESULTS_CELL_DEFAULT_TEMPLATE);
    });

    it('getTemplate(), isSingleColspanedCell = true, with resultTemplate', () => {
        const cell = new GridResultsCell({
            column: {
                template: CELL_TEMPLATE,
                resultTemplate: RESULTS_CELL_TEMPLATE
            },
            owner: {
                hasMultiSelectColumn: () => false,
                isFullGridSupport: () => true
            },
            isSingleColspanedCell: true
        });
        assert.equal(cell.getTemplate(), RESULTS_CELL_TEMPLATE);
    });
});
