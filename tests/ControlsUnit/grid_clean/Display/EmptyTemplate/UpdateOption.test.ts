import { assert } from 'chai';
import * as sinon from 'sinon';
import { RecordSet } from 'Types/collection';
import { GridCollection } from 'Controls/gridNew';

const rawData = [
    { key: 1, col1: 'c1-1', col2: 'с2-1', col3: 'с3-1' },
    { key: 2, col1: 'c1-2', col2: 'с2-2', col3: 'с3-2' },
    { key: 3, col1: 'c1-3', col2: 'с2-3', col3: 'с3-3' },
    { key: 4, col1: 'c1-4', col2: 'с2-4', col3: 'с3-4' }
];
const columns = [
    { displayProperty: 'col1' },
    { displayProperty: 'col2' },
    { displayProperty: 'col3' }
];

describe('Controls/grid_clean/Display/EmptyTemplate/UpdateOption', () => {
    let collection: RecordSet;

    beforeEach(() => {
        collection = new RecordSet({
            rawData: rawData,
            keyProperty: 'key'
        });
    });

    afterEach(() => {
        collection = undefined;
    });

    it('Initialize without emptyTemplate and set emptyTemplate', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns
        });

        assert.notExists(gridCollection.getEmptyGridRow());
        assert.strictEqual(gridCollection.getVersion(), 0);

        gridCollection.setEmptyTemplate(() => {
            return 'EMPTY_TEMPLATE';
        });

        assert.exists(gridCollection.getEmptyGridRow());
        assert.strictEqual(gridCollection.getVersion(), 1);
    });

    it('Initialize with emptyTemplate and reset emptyTemplate', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            emptyTemplate: () => {
                return 'EMPTY_TEMPLATE';
            }
        });

        assert.exists(gridCollection.getEmptyGridRow());
        assert.strictEqual(gridCollection.getVersion(), 0);

        gridCollection.setEmptyTemplate(undefined);

        assert.notExists(gridCollection.getEmptyGridRow());
        assert.strictEqual(gridCollection.getVersion(), 1);
    });

    it('Initialize with emptyTemplate and replace emptyTemplate', () => {
        const gridCollection = new GridCollection({
            collection,
            keyProperty: 'key',
            columns,
            emptyTemplate: () => {
                return 'EMPTY_TEMPLATE';
            }
        });

        const newEmptyTemplate = () => {
            return 'NEW_EMPTY_TEMPLATE';
        };

        const emptyGridRow = gridCollection.getEmptyGridRow();

        const sandbox = sinon.createSandbox();
        const spy = sandbox.spy(emptyGridRow, 'setEmptyTemplate');

        gridCollection.setEmptyTemplate(newEmptyTemplate);

        assert(emptyGridRow.setEmptyTemplate.calledOnce);
        assert.strictEqual(emptyGridRow.setEmptyTemplate.getCall(0).args[0], newEmptyTemplate);
        assert.strictEqual(gridCollection.getVersion(), 1);

        spy.restore();
    });
});
