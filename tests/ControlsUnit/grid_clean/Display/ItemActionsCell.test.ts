import {assert} from 'chai';
import {GridItemActionsCell} from 'Controls/grid';

describe('Controls/grid_clean/Display/ItemActionsCell', () => {
    it('getWrapperStyles', () => {
        const cell = new GridItemActionsCell({
            column: {},
            rowspan: 2,
            owner: {
                isFullGridSupport: () => true
            }
        });
        assert.equal(cell.getWrapperStyles(),
            'width: 0px; min-width: 0px; max-width: 0px; padding: 0px; z-index: 2; grid-row: 1 / 3;');
    });
});
