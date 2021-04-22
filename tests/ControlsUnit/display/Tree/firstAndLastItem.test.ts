import { assert } from 'chai';
import {Tree} from 'Controls/display';
import {List} from 'Types/collection';

interface IData {
    id: number;
    pid?: number;
    node?: boolean;
    title?: string;
}

function getItems(items: IData[]): List<IData> {
    return new List({ items });
}

function getTree(items: List<IData>, options: object = {}): Tree<IData> {
    return new Tree({
        ...options,
        collection: items,
        root: {
            id: 0,
            title: 'Root'
        },
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
            pid: 0,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: 0,
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
            pid: 0,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: 0,
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
    describe('last item is a expanded node', () => {
        const data: IData[] = [{
            id: 1,
            pid: 0,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: 0,
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
    describe('last item is a expanded empty node', () => {
        const data: IData[] = [{
            id: 1,
            pid: 0,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: 0,
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
    describe('last item is a expanded hidden node', () => {
        const data: IData[] = [{
            id: 1,
            pid: 0,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: 0,
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
});
