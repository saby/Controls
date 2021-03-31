import { assert } from 'chai';
import * as sinon from 'sinon';

import { GridCollection } from 'Controls/gridNew';
import { RecordSet } from 'Types/collection';

const RAW_DATA = [
    { id: 1, name: 'Ivan', surname: 'Kashitsyn' },
    { id: 2, name: 'Alexey', surname: 'Kudryavcev' },
    { id: 3, name: 'Olga', surname: 'Samokhvalova' }
];

const columns = [
    { width: '1fr' },
    { width: '1px' },
    { width: '1px' }
];

describe('Controls/grid_clean/display/GridCollection/getResults', () => {
    it('Create results in constructor', () => {
        const sandbox = sinon.createSandbox();

        function MockedResultsRow(options) {
            assert.strictEqual(options.multiSelectVisibility, 'visible');
        }

        sandbox.replace(GridCollection.prototype, 'getResultsRowClass', () => MockedResultsRow);

        const gridCollection = new GridCollection({
            collection: new RecordSet({
                rawData: RAW_DATA,
                keyProperty: 'id'
            }),
            resultsPosition: 'top',
            keyProperty: 'id',
            multiSelectVisibility: 'visible',
            columns
        });

        gridCollection.getResults();

        sandbox.restore();
    });

    it('Create results after setCollection', () => {
        const sandbox = sinon.createSandbox();

        function MockedResultsRow(options) {
            assert.strictEqual(options.multiSelectVisibility, 'visible');
        }

        sandbox.replace(GridCollection.prototype, 'getResultsRowClass', () => MockedResultsRow);

        const gridCollection = new GridCollection({
            resultsPosition: 'top',
            collection: new RecordSet({
                rawData: [],
                keyProperty: 'id'
            }),
            keyProperty: 'id',
            multiSelectVisibility: 'visible',
            columns
        });

        gridCollection.setCollection(new RecordSet({
            rawData: RAW_DATA,
            keyProperty: 'id'
        }));

        gridCollection.getResults();

        sandbox.restore();
    });
});
