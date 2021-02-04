import { assert } from 'chai';
import { Model } from 'Types/entity';
import { GridDataRow } from 'Controls/gridNew';

const TEST_SEARCH_VALUE = 'test';
const rawData = { key: 1, col1: 'c1-1', col2: 'с2-1', col3: 'с3-1' };
const columns = [
    { displayProperty: 'col1' },
    { displayProperty: 'col2' },
    { displayProperty: 'col3' }
];

describe('Controls/grid_clean/Display/SearchValue/DataRow/UpdateOption', () => {
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

    it('Initialize without searchValue and set searchValue', () => {
        const gridDataRow = new GridDataRow({
            contents: model,
            owner: {} as any,
            columns
        });

        assert.isEmpty(gridDataRow.getSearchValue());
        assert.strictEqual(gridDataRow.getVersion(), 0);

        gridDataRow.setSearchValue(TEST_SEARCH_VALUE);

        assert.strictEqual(gridDataRow.getSearchValue(), TEST_SEARCH_VALUE);
        assert.strictEqual(gridDataRow.getVersion(), 1);
    });
});
