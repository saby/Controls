import DataCell from 'Controls/_grid/display/DataCell';
import { assert } from 'chai';

describe('Controls/_grid/display/DataCell/getCellContentRender', () => {
    const owner = {
        getSearchValue: () => '',
        getContents: () => ({}),
        getDisplayValue: () => 'title',
        getLadder: () => ({ field: {}})
    };

    it('with ladder in column', () => {
        const cell = new DataCell({owner, column: { displayProperty: 'field' } });
        assert.equal(cell.getCellContentRender(), 'Controls/grid:LadderWrapper');
    });

    it('clear render template column', () => {
        const cell = new DataCell({owner, column: { displayProperty: 'field' } });
        assert.notEqual(cell.getCellContentRender(true), 'Controls/grid:LadderWrapper');
    });

    it('without ladder in column', () => {
        const cell = new DataCell({owner, column: { displayProperty: 'otherField' } });
        assert.notEqual(cell.getCellContentRender(), 'Controls/grid:LadderWrapper');
    });
});
