import {assert} from 'chai';
import {RecordSet} from 'Types/collection';
import {GridCollection} from 'Controls/grid';
import * as sinon from 'sinon';

describe('Controls/display/collection/BackgroundStyle', () => {
    it('should set backgroundStyle while initializing', () => {
        const recordSet = new RecordSet({ rawData: [] });
        const collection = new GridCollection({
            keyProperty: 'id',
            collection: recordSet,
            backgroundStyle: 'custom',
            columns: [{width: '1px'}]
        });
        assert.equal(collection.getBackgroundStyle(), 'custom');
    });

    it('should set backgroundStyle using setBackgroundStyle', () => {
        const recordSet = new RecordSet({ rawData: [] });
        const collection = new GridCollection({
            keyProperty: 'id',
            collection: recordSet
        });
        assert.strictEqual(collection.getVersion(), 0);
        assert.equal(collection.getBackgroundStyle(), 'default');

        collection.setBackgroundStyle('custom');

        assert.strictEqual(collection.getVersion(), 1);
        assert.equal(collection.getBackgroundStyle(), 'custom');
    });

    it('should set backgroundStyle for every CollectionItem', () => {
        const recordSet = new RecordSet({ rawData: [{id: 0}, {id: 1}, {id: 2}] });
        const collection = new GridCollection({
            keyProperty: 'id',
            collection: recordSet
        });

        const sandbox = sinon.createSandbox();
        collection.getItems().forEach((column) => {
            sandbox.spy(column, 'setBackgroundStyle');
        });

        collection.setBackgroundStyle('custom');

        collection.getItems().forEach((item) => {
            assert(item.setBackgroundStyle.calledOnce);
        });

        sandbox.restore();
    });
});
