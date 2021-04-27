import {assert} from 'chai';
import {Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';

describe('ControlsUnit/display/collection/firstAndLastItem', () => {

    describe('constructor', () => {
        // 1. Инициализация с first and last
        it('_initializeCollection', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });
            assert.isTrue(collection.at(0).isFirstItem());
            assert.isTrue(collection.at(1).isLastItem());
        });
    });

    describe('onCollectionChange', () => {
        // 10. Добавились items. у текущих first и last поменялась версия
        it('New items added. Should change the version', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });

            assert.equal(collection.at(0).getVersion(), 0);
            assert.equal(collection.at(1).getVersion(), 0);

            recordSet.merge(new RecordSet({ rawData: [{id: 3}, {id: 4}], keyProperty: 'id' }), {remove: false, inject: true});

            assert.equal(collection.at(0).getVersion(), 2);
            assert.equal(collection.at(1).getVersion(), 1);
        });

        // 11. Добавились items. first и last поменялись на новые
        it('New items added. Should change the first/last state', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });

            assert.isTrue(collection.at(0).isFirstItem());
            assert.isTrue(collection.at(1).isLastItem());

            recordSet.merge(new RecordSet({ rawData: [{id: 3}, {id: 4}], keyProperty: 'id' }), {remove: false, inject: true });

            assert.isTrue(collection.at(0).isFirstItem());
            assert.isFalse(collection.at(1).isLastItem());
            assert.isFalse(collection.at(2).isFirstItem());
            assert.isTrue(collection.at(3).isLastItem());
        });

        // 12. Добавились items. у текущих first и last поменялась версия
        it('Items removed. Should change the version', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}, {id: 3}, {id: 4}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });

            assert.equal(collection.at(0).getVersion(), 0);
            recordSet.removeAt(0);
            assert.equal(collection.at(0).getVersion(), 1);

            assert.equal(collection.at(1).getVersion(), 0);
            recordSet.removeAt(2);
            assert.equal(collection.at(1).getVersion(), 1);
        });

        // 13. Удалились items. first и last поменялись на новые
        it('Items removed. Should change the first/last state', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}, {id: 3}, {id: 4}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });

            const itemAt1 = collection.at(1);
            const itemAt2 = collection.at(2);

            assert.isFalse(itemAt1.isFirstItem());
            recordSet.removeAt(0);
            assert.isTrue(itemAt1.isFirstItem());

            assert.isFalse(itemAt2.isLastItem());
            recordSet.removeAt(2);
            assert.isTrue(itemAt2.isLastItem());
        });
    });

    it('getLastItem', () => {
        const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
        const collection = new Collection({
            keyProperty: 'id',
            collection: recordSet
        });

        assert.equal(collection.getLastItem(), collection.at(1).getContents());
    });

    it('getFirstItem', () => {
        const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
        const collection = new Collection({
            keyProperty: 'id',
            collection: recordSet
        });

        assert.equal(collection.getFirstItem(), collection.at(0).getContents());
    });
});
