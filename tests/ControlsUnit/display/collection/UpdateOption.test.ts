import {Collection} from "Controls/display";
import {RecordSet} from "Types/collection";
import {assert} from 'chai';
import * as sinon from "sinon";
import {Model} from "Types/entity";

describe('Controls/_display/collection/UpdateOption', () => {
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

    // Коллекция  не может быть создана без данных и нельзя установить пустую коллекцию.
    // Поэтому проверяем только случай когда коллекция была и вызвали установку новой коллекции.
    it('1. Should update subscription on property change of record set. Unsubscribe from old and subscribe to new RecordSet.', () => {
        const oldRecordSet = new RecordSet({rawData: []});
        const newRecordSet = new RecordSet({rawData: []});

        const collection = new Collection({
            keyProperty: 'id',
            collection: oldRecordSet
        });

        const subscribeSpy = sandbox.spy(newRecordSet, 'subscribe');
        const unsubscribeSpy = sandbox.spy(oldRecordSet, 'unsubscribe');

        collection.setCollection(newRecordSet);

        assert.isTrue(subscribeSpy.calledWith('onPropertyChange'));
        assert.isTrue(unsubscribeSpy.calledWith('onPropertyChange'));
    });

    describe('2. Should update subscription on meta-results model', () => {

        it('1. [without meta-results] -> [with meta-results]. Should subscribe on new meta results.', () => {
            const results = createMetaResults();
            const oldRecordSet = createRecordSet();
            const newRecordSet = createRecordSet({results});

            const collection = new Collection({
                keyProperty: 'id',
                collection: oldRecordSet
            });

            const subscribeSpy = sandbox.spy(results, 'subscribe');

            collection.setCollection(newRecordSet);

            assert.isTrue(subscribeSpy.calledWith('onPropertyChange'));
        });

        it('2. [with meta-results] -> [without meta-results]. Should unsubscribe from old meta results.', () => {
            const results = createMetaResults();
            const oldRecordSet = createRecordSet({results});
            const newRecordSet = createRecordSet();

            const collection = new Collection({
                keyProperty: 'id',
                collection: oldRecordSet
            });

            const unsubscribeSpy = sandbox.spy(results, 'unsubscribe');

            collection.setCollection(newRecordSet);

            assert.isTrue(unsubscribeSpy.calledWith('onPropertyChange'));
        });

        it('3. [with meta-results] -> [with meta-results]. Should unsubscribe from old meta results and subscribe to new.', () => {
            const oldResults = createMetaResults();
            const newResults = createMetaResults();
            const oldRecordSet = createRecordSet({results: oldResults});
            const newRecordSet = createRecordSet({results: newResults});

            const collection = new Collection({
                keyProperty: 'id',
                collection: oldRecordSet
            });

            const unsubscribeSpy = sandbox.spy(oldResults, 'unsubscribe');
            const subscribeSpy = sandbox.spy(newResults, 'subscribe');

            collection.setCollection(newRecordSet);

            assert.isTrue(unsubscribeSpy.calledWith('onPropertyChange'));
            assert.isTrue(subscribeSpy.calledWith('onPropertyChange'));
        });
    });

    describe('3. Should update meta results state', () => {

        it('1. [without meta-results] -> [with meta-results]', () => {
            const results = createMetaResults();
            const oldRecordSet = createRecordSet();
            const newRecordSet = createRecordSet({results});

            const collection = new Collection({
                keyProperty: 'id',
                collection: oldRecordSet
            });

            assert.isUndefined(collection.getMetaResults());
            collection.setCollection(newRecordSet);
            assert.equal(results, collection.getMetaResults());
        });

        it('2. [with meta-results] -> [without meta-results]. Should unsubscribe from old meta results.', () => {
            const results = createMetaResults();
            const oldRecordSet = createRecordSet({results});
            const newRecordSet = createRecordSet();

            const collection = new Collection({
                keyProperty: 'id',
                collection: oldRecordSet
            });

            assert.equal(results, collection.getMetaResults());
            collection.setCollection(newRecordSet);
            assert.isUndefined(collection.getMetaResults());
        });
    });
});
