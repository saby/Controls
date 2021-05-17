import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { GridCollection } from 'Controls/grid';

const rawData = [
    { key: 1, ladder: '1', group: '1', text: 'item-1' },
    { key: 2, ladder: '1', group: '1', text: 'item-2' },
    { key: 3, ladder: '2', group: '2', text: 'item-3' },
    { key: 4, ladder: '3', group: '2', text: 'item-4' }
];
const columns = [
    { displayProperty: 'text' }
];

describe('Controls/grid_clean/Display/Ladder/UpdateOption', () => {
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

    it('Initialize without ladder and set ladder', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            groupProperty: 'group'
        });

        // group initialized with colspan "1 / 2"
        assert.strictEqual(gridCollection.at(0).getColumns()[0].getColspanStyles(), 'grid-column: 1 / 2;');

        // set ladder
        gridCollection.setColumns([
            { displayProperty: 'text', stickyProperty: 'ladder' }
        ]);
        gridCollection.setLadderProperties(['ladder']);

        // group must recalculate with colspan "1 / 3"
        assert.strictEqual(gridCollection.at(0).getColumns()[0].getColspanStyles(), 'grid-column: 1 / 3;');
    });
});
