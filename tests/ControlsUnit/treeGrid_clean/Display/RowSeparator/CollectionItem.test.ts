import { assert } from 'chai';
import {TreeGridCollection} from 'Controls/treeGrid';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {Collection} from "Controls/display";

interface IData {
    id: number;
    pid?: number;
    node?: boolean;
    title?: string;
    group?: string;
}

function getItems(rawData: IData[]): RecordSet<IData> {
    return new RecordSet({ rawData, keyProperty: 'id' });
}

function getTreeGrid(items: RecordSet<IData>, options: object = {}): TreeGridCollection<Model<any>> {
    return new TreeGridCollection({
        ...options,
        columns: [{width: '1px'}],
        collection: items,
        root: null,
        keyProperty: 'id',
        parentProperty: 'pid',
        nodeProperty: 'node',
        hasChildrenProperty: 'hasChildren'
    });
}

describe('Controls/treeGrid/Display/RowSeparator/CollectionItem', () => {

    // 1. Дерево и последняя запись - не нода
    describe('last item is not a node', () => {
        const data: IData[] = [{
            id: 1,
            pid: null,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: null,
            node: null,
            title: 'C'
        }];
        it('getLastItem', () => {
            const tree = getTreeGrid(getItems(data));
            assert.isTrue(tree.isLastItem(tree.at(1)));
        });
    });

    // 2. Дерево и последняя запись - закрытая нода
    describe('last item is a collapsed node', () => {
        const data: IData[] = [{
            id: 1,
            pid: null,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: null,
            node: true,
            title: 'B'
        }, {
            id: 20,
            pid: 2,
            node: null,
            title: 'BB'
        }];
        it('getLastItem', () => {
            const tree = getTreeGrid(getItems(data));
            assert.isTrue(tree.isLastItem(tree.at(1)));
        });
    });

    // 3. Дерево и последняя запись - открытая нода
    describe('last item is an expanded node', () => {
        const data: IData[] = [{
            id: 1,
            pid: null,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: null,
            node: true,
            title: 'B'
        }, {
            id: 20,
            pid: 2,
            node: null,
            title: 'BB'
        }];
        it('getLastItem', () => {
            const tree = getTreeGrid(getItems(data), {
                expandedItems: [2]
            });
            assert.isTrue(tree.isLastItem(tree.at(2)));
        });
    });

    // 4. Дерево и последняя запись - пустая открытая нода
    describe('last item is an expanded empty node', () => {
        const data: IData[] = [{
            id: 1,
            pid: null,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: null,
            node: true,
            title: 'B'
        }];
        it('getLastItem', () => {
            const tree = getTreeGrid(getItems(data), {
                expandedItems: [2]
            });
            assert.isTrue(tree.isLastItem(tree.at(1)));
        });
    });

    // 5. Дерево и последняя запись - открытая скрытая нода
    describe('last item is an expanded hidden node', () => {
        const data: IData[] = [{
            id: 1,
            pid: null,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: null,
            node: false,
            title: 'B'
        }, {
            id: 20,
            pid: 2,
            node: null,
            title: 'BB'
        }];
        it('getLastItem', () => {
            const tree = getTreeGrid(getItems(data), {
                expandedItems: [2]
            });
            assert.isTrue(tree.isLastItem(tree.at(2)));
        });
    });

    // Изменения в RecordSet
    describe('onCollectionChange', () => {
        let data: IData[];
        let recordSet: RecordSet;
        let collection: TreeGridCollection<Model<any>>;

        beforeEach(() => {
            data = [
                {id: 1, pid: null, node: true},
                {id: 2, pid: 1, node: null},
                {id: 3, pid: null, node: true},
                {id: 4, pid: 3, node: null},
                {id: 5, pid: 3, node: null}
            ];
            recordSet = getItems(data);
            collection = getTreeGrid(recordSet, {
                expandedItems: [1, 3]
            });
        });

        // 5. move (recordset)
        it('RecordSet + move', () => {
            const initialLastItem = collection.at(5);

            assert.isTrue(collection.isLastItem(initialLastItem));

            recordSet.move(4, 3);

            assert.isFalse(collection.isLastItem(initialLastItem));
            assert.isTrue(collection.isLastItem(collection.at(5)));
        });

        // 7. change parent (recordset)
        it('RecordSet + parent', () => {
            const initialLastItem = collection.at(5);

            assert.isTrue(collection.isLastItem(initialLastItem));

            recordSet.at(4).set('pid', 1);

            assert.isFalse(collection.isLastItem(initialLastItem));
            assert.isTrue(collection.isLastItem(collection.at(5)));
        });
    });

    // 7. Дерево и смена root
    it('should update last item when root was changed', () => {
        const data: IData[] = [{
            id: 1,
            pid: null,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: null,
            node: false,
            title: 'B'
        }, {
            id: 20,
            pid: 2,
            node: null,
            title: 'BB'
        }];
        const tree = getTreeGrid(getItems(data), {
            expandedItems: [2]
        });
        assert.isTrue(tree.isLastItem(tree.at(2)));
        tree.setRoot(1);
        assert.isTrue(tree.isLastItem(tree.at(0)));
    });

    // 8. DragAndDrop
    it('DnD', () => {
        const data = [
            {id: 1, pid: null, node: true},
            {id: 2, pid: 1, node: null},
            {id: 3, pid: null, node: true},
            {id: 4, pid: 3, node: null},
            {id: 5, pid: 3, node: null}
        ];
        const recordSet = getItems(data);
        const collection = getTreeGrid(recordSet, {
            expandedItems: [1, 3]
        });

        const initialLastItem = collection.at(5);
        const record = recordSet.getRecordById(5);

        assert.isTrue(collection.isLastItem(initialLastItem));

        collection.setDraggedItems(initialLastItem, [5]);
        collection.setDragPosition({
            index: 1,
            position: 'after',
            dispItem: initialLastItem
        });

        record.set({ pid: 1 });
        recordSet.add(record, 2);
        recordSet.remove(record);
        collection.resetDraggedItems();

        assert.isFalse(collection.isLastItem(initialLastItem));
        assert.isTrue(collection.isLastItem(collection.at(5)));
    });

    describe('With groups', () => {
        // 9 Инициализация с группировкой
        it('constructor', () => {

            // Группировка всегда должна приходить от прикладника в правильном порядке
            const data = [
                {id: 1, pid: null, node: true, group: 'g1'},
                {id: 2, pid: 1, node: null, group: 'g1'},
                {id: 3, pid: null, node: true, group: 'g2'},
                {id: 4, pid: 3, node: null, group: 'g2'},
                {id: 5, pid: null, node: null, group: 'g3'}
            ];
            const collection = getTreeGrid(getItems(data), {
                groupProperty: 'group',
                expandedItems: [1, 3]
            });
            assert.isTrue(collection.isLastItem(collection.at(9)));
        });

        // 9.1 Добавили записи в RS
        it('New items added', () => {
            const data = [
                {id: 1, pid: null, node: true, group: 'g1'},
                {id: 2, pid: 1, node: null, group: 'g1'},
                {id: 3, pid: null, node: true, group: 'g2'},
                {id: 4, pid: 3, node: null, group: 'g2'}
            ];
            const recordSet = getItems(data);
            const collection = getTreeGrid(recordSet, {
                groupProperty: 'group',
                expandedItems: [1, 3]
            });

            const initialLastItem = collection.at(6);

            assert.isTrue(collection.isLastItem(initialLastItem));

            const item = new Model({
                rawData: {id: 5, pid: 3, node: null, group: 'g2'},
                keyProperty: 'id'
            });

            recordSet.add(item, 4);

            assert.isFalse(collection.isLastItem(initialLastItem));
            assert.isTrue(collection.isLastItem(collection.at(7)));
        });

        // 10. Смена groupProperty с пересортировкой возможна только со сменой parent,
        // поэтому это тут не тестируем. Смена parent протестирована выше
    });

    // 9. Create in collection
    it('create in collection', () => {
        const data = [
            {id: 1, pid: null, node: true},
            {id: 2, pid: 1, node: null},
            {id: 3, pid: null, node: true},
            {id: 4, pid: 3, node: null}
        ];
        const recordSet = getItems(data);
        const collection = getTreeGrid(recordSet, {
            groupProperty: 'group',
            expandedItems: [1, 3]
        });

        const item = new Model({
            rawData: {
                id: 5,
                pid: 3,
                node: null
            },
            keyProperty: 'id'
        });

        const newItem = collection.createItem({
            contents: item,
            isAdd: true,
            addPosition: 'bottom'
        });

        const initialLastItem = collection.at(5);

        assert.isTrue(collection.isLastItem(initialLastItem));

        newItem.setEditing(true, item, false);
        collection.setAddingItem(newItem, {position: 'bottom'});

        assert.isFalse(collection.isLastItem(initialLastItem));
        assert.isTrue(collection.isLastItem(newItem));
    });
});
