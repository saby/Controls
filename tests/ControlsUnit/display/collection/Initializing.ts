import {Collection as CollectionDisplay, Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {assert} from 'chai';
import * as sinon from 'sinon';

describe('Controls/_display/collection/Initializing', () => {
    it('1. should subscribe on property change of RecordSet', () => {
        const sandbox = sinon.createSandbox();

        const recordSet = new RecordSet({ rawData: [] });
        const subscribeSpy = sandbox.spy(recordSet, 'subscribe');

        new Collection({
            keyProperty: 'id',
            collection: recordSet
        });

        assert.isTrue(subscribeSpy.calledWith('onPropertyChange'));
        sandbox.restore();
    });

    it('2. should subscribe on property change of meta results', () => {
        const sandbox = sinon.createSandbox();

        const metaResults = new Model({ rawData: {}});
        const recordSet = new RecordSet({
            rawData: [],
            metaData: { results: metaResults }
        });

        const subscribeSpy = sandbox.spy(metaResults, 'subscribe');

        new Collection({
            keyProperty: 'id',
            collection: recordSet
        });

        assert.isTrue(subscribeSpy.calledWith('onPropertyChange'));
        sandbox.restore();
    });

    it('3. Should set meta results', () => {
        const results = new Model({rawData: {}});
        const list = new RecordSet({
            keyProperty: 'id',
            rawData: [],
            metaData: {results}
        });
        const display = new CollectionDisplay({collection: list});

        assert.equal(results, display.getMetaResults());
    });
});
