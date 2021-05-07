import { assert } from 'chai';
import {Tree} from 'Controls/display';
import {RecordSet} from 'Types/collection';

interface IData {
    id: number;
    pid?: number;
    node?: boolean;
    title?: string;
}

function getItems(rawData: IData[]): RecordSet<IData> {
    return new RecordSet({ rawData, keyProperty: 'id' });
}

function getTree(items: RecordSet<IData>, options: object = {}): Tree<IData> {
    return new Tree({
        ...options,
        collection: items,
        root: null,
        keyProperty: 'id',
        parentProperty: 'pid',
        nodeProperty: 'node',
        hasChildrenProperty: 'hasChildren'
    });
}

describe('Controls/display/Tree/firstAndLastItem', () => {

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
            const tree = getTree(getItems(data));
            assert.equal(tree.getLastItem(), tree.at(2).getContents());
        });

        it('getFirstItem', () => {
            const tree = getTree(getItems(data));
            assert.equal(tree.getFirstItem(), tree.at(0).getContents());
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
            const tree = getTree(getItems(data));
            assert.equal(tree.getLastItem(), tree.at(2).getContents());
        });

        it('getFirstItem', () => {
            const tree = getTree(getItems(data));
            assert.equal(tree.getFirstItem(), tree.at(0).getContents());
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
            const tree = getTree(getItems(data), {
                expandedItems: [2]
            });
            assert.equal(tree.getLastItem(), tree.at(3).getContents());
        });

        it('getFirstItem', () => {
            const tree = getTree(getItems(data));
            assert.equal(tree.getFirstItem(), tree.at(0).getContents());
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
            const tree = getTree(getItems(data), {
                expandedItems: [2]
            });
            assert.equal(tree.getLastItem(), tree.at(2).getContents());
        });

        it('getFirstItem', () => {
            const tree = getTree(getItems(data));
            assert.equal(tree.getFirstItem(), tree.at(0).getContents());
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
            const tree = getTree(getItems(data), {
                expandedItems: [2]
            });
            assert.equal(tree.getLastItem(), tree.at(3).getContents());
        });

        it('getFirstItem', () => {
            const tree = getTree(getItems(data));
            assert.equal(tree.getFirstItem(), tree.at(0).getContents());
        });
    });

    // 6. Дерево и первый элемент коллекции находится во второй папке
    it('should correctly get first hierarchical item', () => {
        const data: IData[] = [{
            id: 20,
            pid: 2,
            node: null,
            title: 'BB'
        }, {
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
        }];

        it('getFirstItem', () => {
            const tree = getTree(getItems(data));
            assert.equal(tree.getFirstItem(), tree.at(1).getContents());
        });
    });

    // 7. Дерево и смена root
    describe('should update last and first items when root was changed', () => {
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
        const tree = getTree(getItems(data), {
            expandedItems: [2]
        });
        assert.equal(tree.getLastItem(), tree.at(3).getContents());
        assert.equal(tree.getFirstItem(), tree.at(0).getContents());
        tree.setRoot(1);
        assert.equal(tree.getLastItem(), tree.at(0).getContents());
        assert.equal(tree.getFirstItem(), tree.at(0).getContents());
    });
});
