import {assert} from 'chai';
import {Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';

describe('Controls/list/display/RowSeparator/CollectionItem', () => {

    // 1.  Плоский список после инициализации
    describe('constructor', () => {
        it('_initializeCollection', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });
            assert.isTrue(collection.at(1).isLastItem());
        });
    });

    // Изменения в RecordSet
    describe('onCollectionChange', () => {

        // 4. remove (recordset)
        it('RecordSet + remove', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}, {id: 3}, {id: 4}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });

            const itemAt2 = collection.at(2);
            assert.isFalse(itemAt2.isLastItem());
            recordSet.removeAt(3);
            assert.isTrue(itemAt2.isLastItem());
        });

        // 5. move (recordset)
        it('RecordSet + move', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}, {id: 3}, {id: 4}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });

            const initialLastItem = collection.at(3);
            assert.isTrue(initialLastItem.isLastItem());

            recordSet.move(3, 1);

            assert.isFalse(initialLastItem.isLastItem());
            assert.isTrue(collection.at(3).isLastItem());
        });

        // 6. add (recordset)
        it('RecordSet + add', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });

            const item = new Model({
                rawData: {id: 3},
                keyProperty: 'id'
            });

            const initialLastItem = collection.at(1);
            assert.isTrue(initialLastItem.isLastItem());

            recordSet.add(item, 2);

            assert.isFalse(initialLastItem.isLastItem());
            assert.isTrue(collection.at(2).isLastItem());
        });

        // 2.1 Записи добавились через merge
        it('RecordSet + merge', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });

            assert.isTrue(collection.at(1).isLastItem());

            recordSet.merge(new RecordSet({ rawData: [{id: 3}, {id: 4}], keyProperty: 'id' }), {remove: false, inject: true });

            assert.isFalse(collection.at(1).isLastItem());
            assert.isTrue(collection.at(3).isLastItem());
        });

        // 2.2 Записи добавились через assign
        it('RecordSet + assign', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });

            const itemAt1 = collection.at(1);
            assert.isTrue(itemAt1.isLastItem());

            recordSet.assign(new RecordSet({ rawData: [{id: 3}, {id: 4}], keyProperty: 'id' }));

            assert.isFalse(itemAt1.isLastItem());
            assert.isTrue(collection.at(1).isLastItem());
        });

        // 2.3 Записи добавились через append
        it('RecordSet + append', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet
            });

            assert.isTrue(collection.at(1).isLastItem());

            recordSet.append(new RecordSet({ rawData: [{id: 3}, {id: 4}], keyProperty: 'id' }));

            assert.isFalse(collection.at(1).isLastItem());
            assert.isTrue(collection.at(3).isLastItem());
        });
    });

    // 8. DragAndDrop
    it('DnD', () => {
        const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}, {id: 3}, {id: 4}], keyProperty: 'id' });
        const collection = new Collection({
            keyProperty: 'id',
            collection: recordSet
        });

        const initialLastItem = collection.at(3);
        const record = recordSet.getRecordById(4);

        assert.isTrue(initialLastItem.isLastItem());

        collection.setDraggedItems(initialLastItem, [4]);
        collection.setDragPosition({
            index: 1,
            position: 'after',
            dispItem: initialLastItem
        });
        recordSet.add(record, 2);
        recordSet.remove(record);
        collection.resetDraggedItems();

        assert.isFalse(initialLastItem.isLastItem());
        assert.isTrue(collection.at(3).isLastItem());
    });

    describe('With groups', () => {
        // 9 Инициализация с группировкой
        it('constructor', () => {

            // Группировка всегда должна приходить от прикладника в правильном порядке
            const recordSet = new RecordSet({ rawData: [
                {id: 1, group: 'g1'},
                {id: 2, group: 'g1'},
                {id: 3, group: 'g2'},
                {id: 4, group: 'g2'},
                {id: 5, group: 'g3'}
            ], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet,
                groupProperty: 'group'
            });
            assert.isTrue(collection.at(7).isLastItem());
        });

        // 9.1 Добавили записи в RS
        it('New items added', () => {
            const recordSet = new RecordSet({ rawData: [
                {id: 1, group: 'g1'},
                {id: 2, group: 'g1'},
                {id: 3, group: 'g2'},
                {id: 4, group: 'g2'}
            ], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet,
                groupProperty: 'group'
            });
            const itemAt5 = collection.at(5);

            assert.isTrue(itemAt5.isLastItem());

            const item = new Model({
                rawData: {id: 3, group: 'g2'},
                keyProperty: 'id'
            });

            recordSet.add(item, 4);

            assert.isFalse(itemAt5.isLastItem());
            assert.isTrue(collection.at(6).isLastItem());
        });

        // 10. Смена groupProperty
        it('Group changed', () => {
            const recordSet = new RecordSet({ rawData: [
                    {id: 1, group: 'g1', group2: 'g21'},
                    {id: 2, group: 'g1', group2: 'g22'},
                    {id: 3, group: 'g2', group2: 'g22'},
                    {id: 4, group: 'g2', group2: 'g21'}
                ], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet,
                groupProperty: 'group'
            });
            const initialLastItem = collection.at(5);

            assert.isTrue(initialLastItem.isLastItem());

            collection.setGroupProperty('group2');

            assert.isFalse(initialLastItem.isLastItem());
            assert.isTrue(collection.at(5).isLastItem());
        });
    });

    // 9. Create in collection
    it('create in collection', () => {
        const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
        const collection = new Collection({
            keyProperty: 'id',
            collection: recordSet
        });

        const item = new Model({
            rawData: {
                id: 3
            },
            keyProperty: 'id'
        });

        const newItem = collection.createItem({
            contents: item,
            isAdd: true,
            addPosition: 'bottom'
        });

        const initialLastItem = collection.at(1);

        assert.isTrue(initialLastItem.isLastItem());

        newItem.setEditing(true, item, false);
        collection.setAddingItem(newItem);

        assert.isFalse(initialLastItem.isLastItem());
        assert.isTrue(newItem.isLastItem());
    });
});
