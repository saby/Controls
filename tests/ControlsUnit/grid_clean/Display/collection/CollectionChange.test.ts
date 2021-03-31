import {GridCollection, GridResultsRow} from "Controls/gridNew";
import {RecordSet} from 'Types/collection';
import {assert} from 'chai';
import * as sinon from 'sinon';

describe('Controls/_display/collection/CollectionChange', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Update results row (create / delete)', () => {

        it('[has no results] -> [has results]. Should initialize results.', () => {
            const recordSet = new RecordSet({rawData: []});
            const collection = new GridCollection({
                keyProperty: 'id',
                columns: [],
                collection: recordSet,
                resultsPosition: 'top'
            });

            assert.isUndefined(collection.getResults());
            recordSet.append(new RecordSet({rawData: [{}, {}, {}]}));

            assert.instanceOf(collection.getResults(), GridResultsRow);
        });

        it('[has results] -> [has no results]. Should destroy results.', () => {
            const recordSet = new RecordSet({rawData: [{}, {}, {}]});
            const collection = new GridCollection({
                keyProperty: 'id',
                columns: [],
                collection: recordSet,
                resultsPosition: 'top'
            });

            assert.instanceOf(collection.getResults(), GridResultsRow);
            recordSet.clear();
            assert.isNull(collection.getResults());
        });
    });
});
