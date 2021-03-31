import {Collection} from "Controls/display";
import {RecordSet} from "Types/collection";
import {assert} from 'chai';
import * as sinon from "sinon";
import {Model} from "Types/entity";

describe('Controls/_display/collection/UpdateMetaData', () => {
    let sandbox: sinon.SinonSandbox;
    const createRecordSet = (metaData?) => new RecordSet({
        keyProperty: 'id',
        rawData: [],
        metaData
    });
    const createMetaResults = () => new Model({rawData: {}});

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('1. Update version and meta results state', () => {
        const results = createMetaResults();
        const oldRecordSet = createRecordSet();
        const newRecordSet = createRecordSet({results});

        const collection = new Collection({
            keyProperty: 'id',
            collection: oldRecordSet
        });

        assert.equal(collection.getVersion(), 0);
        assert.isUndefined(collection.getMetaResults());

        collection.setCollection(newRecordSet);

        assert.equal(collection.getVersion(), 1);
        assert.equal(collection.getMetaResults(), results);
    });
});
