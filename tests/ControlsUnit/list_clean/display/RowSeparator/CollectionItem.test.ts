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
                collection: recordSet,
                rowSeparatorSize: 's'
            });
            assert.isTrue(collection.at(1).isBottomSeparatorEnabled());
        });
    });

    // Изменения в RecordSet
    describe('onCollectionChange', () => {

        // 4. remove (recordset)
        it('RecordSet + remove', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}, {id: 3}, {id: 4}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet,
                rowSeparatorSize: 's'
            });

            assert.isFalse(collection.getItemBySourceKey(3).isBottomSeparatorEnabled());
            recordSet.removeAt(3);
            assert.isTrue(collection.getItemBySourceKey(3).isBottomSeparatorEnabled());
        });

        // 5. move (recordset)
        it('RecordSet + move', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}, {id: 3}, {id: 4}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet,
                rowSeparatorSize: 's'
            });

            const initialLastItem = collection.at(3);
            assert.isTrue(initialLastItem.isBottomSeparatorEnabled());

            recordSet.move(3, 1);

            assert.isFalse(initialLastItem.isBottomSeparatorEnabled());
            assert.isTrue(collection.at(3).isBottomSeparatorEnabled());
        });

        // 6. add (recordset)
        it('RecordSet + add', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet,
                rowSeparatorSize: 's'
            });

            const item = new Model({
                rawData: {id: 3},
                keyProperty: 'id'
            });

            const initialLastItem = collection.at(1);
            assert.isTrue(initialLastItem.isBottomSeparatorEnabled());

            recordSet.add(item, 2);

            assert.isFalse(initialLastItem.isBottomSeparatorEnabled());
            assert.isTrue(collection.at(2).isBottomSeparatorEnabled());
        });

        // 2.1 Записи добавились через merge
        it('RecordSet + merge', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet,
                rowSeparatorSize: 's'
            });

            assert.isTrue(collection.at(1).isBottomSeparatorEnabled());

            recordSet.merge(new RecordSet({ rawData: [{id: 3}, {id: 4}], keyProperty: 'id' }), {remove: false, inject: true });

            assert.isFalse(collection.at(1).isBottomSeparatorEnabled());
            assert.isTrue(collection.at(3).isBottomSeparatorEnabled());
        });

        // 2.2 Записи добавились через assign
        it('RecordSet + assign', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet,
                rowSeparatorSize: 's'
            });

            const initialLastItem = collection.getItemBySourceKey(2);
            assert.isTrue(initialLastItem.isBottomSeparatorEnabled());

            recordSet.assign(new RecordSet({ rawData: [{id: 3}, {id: 4}], keyProperty: 'id' }));

            assert.notEqual(collection.getItemBySourceKey(2), initialLastItem);
            assert.isTrue(collection.getItemBySourceKey(4).isBottomSeparatorEnabled());
        });

        // 2.3 Записи добавились через append
        it('RecordSet + append', () => {
            const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
            const collection = new Collection({
                keyProperty: 'id',
                collection: recordSet,
                rowSeparatorSize: 's'
            });

            assert.isTrue(collection.at(1).isBottomSeparatorEnabled());

            recordSet.append(new RecordSet({ rawData: [{id: 3}, {id: 4}], keyProperty: 'id' }));

            assert.isFalse(collection.at(1).isBottomSeparatorEnabled());
            assert.isTrue(collection.at(3).isBottomSeparatorEnabled());
        });
    });

    // 8. DragAndDrop
    it('DnD', () => {
        const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}, {id: 3}, {id: 4}], keyProperty: 'id' });
        const collection = new Collection({
            keyProperty: 'id',
            collection: recordSet,
            rowSeparatorSize: 's'
        });

        const initialLastItem = collection.getItemBySourceKey(4);
        const record = recordSet.getRecordById(4);

        assert.isTrue(initialLastItem.isBottomSeparatorEnabled());

        collection.setDraggedItems(initialLastItem, [4]);
        collection.setDragPosition({
            index: 1,
            position: 'after',
            dispItem: initialLastItem
        });
        recordSet.add(record, 2);
        recordSet.remove(record);
        collection.resetDraggedItems();

        assert.isFalse(collection.getItemBySourceKey(4).isBottomSeparatorEnabled());
        assert.isTrue(collection.at(3).isBottomSeparatorEnabled());
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
                groupProperty: 'group',
                rowSeparatorSize: 's'
            });
            assert.isTrue(collection.at(7).isBottomSeparatorEnabled());
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
                groupProperty: 'group',
                rowSeparatorSize: 's'
            });
            const itemAt5 = collection.at(5);

            assert.isTrue(itemAt5.isBottomSeparatorEnabled());

            const item = new Model({
                rawData: {id: 3, group: 'g2'},
                keyProperty: 'id'
            });

            recordSet.add(item, 4);

            assert.isFalse(itemAt5.isBottomSeparatorEnabled());
            assert.isTrue(collection.at(6).isBottomSeparatorEnabled());
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
                groupProperty: 'group',
                rowSeparatorSize: 's'
            });
            const initialLastItem = collection.getItemBySourceKey(4);
            assert.equal(initialLastItem, collection.at(5));

            assert.isTrue(initialLastItem.isBottomSeparatorEnabled());

            collection.setGroupProperty('group2');

            assert.notEqual(initialLastItem, collection.at(5));
            assert.isTrue(collection.getItemBySourceKey(3).isBottomSeparatorEnabled());
            assert.isFalse(initialLastItem.isBottomSeparatorEnabled());
        });
    });

    // 9. Create in collection
    it('create in collection', () => {
        const recordSet = new RecordSet({ rawData: [{id: 1}, {id: 2}], keyProperty: 'id' });
        const collection = new Collection({
            keyProperty: 'id',
            collection: recordSet,
            rowSeparatorSize: 's'
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

        const initialLastItem = collection.getItemBySourceKey(2);

        assert.isTrue(initialLastItem.isBottomSeparatorEnabled());

        newItem.setEditing(true, item, false);
        collection.setAddingItem(newItem, {position: 'bottom'});

        assert.isFalse(collection.getItemBySourceKey(2).isBottomSeparatorEnabled());
        assert.isTrue(newItem.isBottomSeparatorEnabled());
    });

    it('setHasMoreData', () => {
        const recordSet = new RecordSet({ rawData: [{id: 1}], keyProperty: 'id' });
        const collection = new Collection({
            keyProperty: 'id',
            collection: recordSet,
            rowSeparatorSize: 's',
            navigation: {
                view: 'infinity',
                viewConfig: {
                    pagingMode: 'page'
                }
            }
        });
        assert.isTrue(collection.at(0).isBottomSeparatorEnabled());

        collection.setHasMoreData({up: false, down: true});
        assert.isFalse(collection.at(0).isBottomSeparatorEnabled());

        collection.setHasMoreData({up: false, down: false});
        assert.isTrue(collection.at(0).isBottomSeparatorEnabled());
    });
});
