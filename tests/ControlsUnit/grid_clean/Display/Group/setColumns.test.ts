import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { GridCollection} from 'Controls/grid';

const rawData = [
    { key: 1, col1: 'c1-1', col2: 'с2-1', group: 'g1' },
    { key: 2, col1: 'c1-2', col2: 'с2-2', group: 'g1' },
    { key: 3, col1: 'c1-3', col2: 'с2-3', group: 'g1' },
    { key: 4, col1: 'c1-4', col2: 'с2-4', group: 'g1' }
];
const columns = [
    { displayProperty: 'col1' },
    { displayProperty: 'col2' }
];

describe('Controls/grid_clean/Display/Group/setColumns', () => {
    let collection: RecordSet;
    beforeEach(() => {
        collection = new RecordSet({
            rawData,
            keyProperty: 'key'
        });
    });

    afterEach(() => {
        collection = undefined;
    });

    it('setColumns and check that all items has new columns', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            groupProperty: 'group',
            stickyHeader: true,
            columns
        });
        const newColumns = [
            { displayProperty: 'col1' },
            { displayProperty: 'col2' },
            { displayProperty: 'col3' }
        ];
        gridCollection.setColumns(newColumns);
        gridCollection.each((item) => {
            assert.equal(item.getGridColumnsConfig(), newColumns);
        });
    });
});
