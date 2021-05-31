import {assert} from 'chai';
import * as sinon from 'sinon';
import {ISourceControllerOptions, NewSourceController, nodeHistoryUtil} from 'Controls/dataSource';
import {CrudEntityKey, Memory} from 'Types/source';

const hierarchyItems = [
    {
        key: 0,
        title: 'Интерфейсный фреймворк',
        parent: null,
        type: true,
        nodeType: 'group'
    },
    {
        key: 1,
        title: 'Sasha',
        type: null,
        parent: 0
    },
    {
        key: 2,
        title: 'Dmitry',
        type: null,
        parent: 0
    },
    {
        key: 3,
        title: 'Списки',
        type: true,
        parent: 0
    },
    {
        key: 31,
        title: 'Alex',
        type: null,
        parent: 3
    },
    {
        key: 4,
        title: 'Склад',
        parent: null,
        type: true,
        nodeType: 'group'
    },
    {
        key: 5,
        title: 'Michail',
        type: null,
        parent: 4
    }
];

const filterByEntries = (item, filter): boolean => {
    return filter.entries ? filter.entries.get('marked').includes(String(item.get('key'))) : true;
};

function getMemoryWithHierarchyItems(): Memory {
    return new Memory({
        data: hierarchyItems,
        keyProperty: 'key',
        filter: filterByEntries
    });
}

function getControllerWithHierarchyOptions(): ISourceControllerOptions {
    return {
        source: getMemoryWithHierarchyItems(),
        parentProperty: 'parent',
        nodeProperty: 'type',
        filter: {},
        keyProperty: 'key'
    };
}

function getController(additionalOptions: object = {}): NewSourceController {
    return new NewSourceController({...getControllerWithHierarchyOptions(), ...additionalOptions});
}

describe('Controls/dataSource/Controller/NodeHistoryId', () => {
    // 1. Если !expandedItems && options.nodeHistoryId то дёргаем History При загрузке
    it('should call restore from history method', async () => {
        const sinonSandbox = sinon.createSandbox();
        const controller = getController({
            expandedItems: undefined,
            nodeHistoryId: 'NODE_HISTORY_ID'
        });

        const stubRestore = sinonSandbox.stub(nodeHistoryUtil, 'restore').callsFake( (id) => {
            assert.equal(id, 'NODE_HISTORY_ID');
            return Promise.resolve([1]);
        });

        await controller.reload(null, true);

        sinonSandbox.assert.calledOnce(stubRestore);
        sinonSandbox.restore();
    });

    // 2. Если expandedItems && options.nodeHistoryId то всё равно дёргаем History При загрузке
    it('should call restore from history method when expandedItems', async () => {
        const controller = getController({
            expandedItems: [1],
            nodeHistoryId: 'NODE_HISTORY_ID'
        });
        const spyRestore = sinon.spy(nodeHistoryUtil, 'restore');
        await controller.reload(null, true);

        sinon.assert.called(spyRestore);
        spyRestore.restore();
    });

    // 3. Если !options.nodeHistoryId то не дёргаем History При загрузке
    it('should not call restore from history method when no nodeHistoryId', async () => {
        const controller = getController({
            nodeHistoryId: undefined
        });
        const stubRestore = sinon.spy(nodeHistoryUtil, 'restore');
        await controller.reload(null, true);

        sinon.assert.notCalled(stubRestore);
        stubRestore.restore();
    });

    // 4. Не дёргаем History если isFirstLoad !== true
    it('should not call restore from history method when no nodeHistoryId', async () => {
        const controller = getController({
            nodeHistoryId: 'NODE_HISTORY_ID'
        });
        const stubRestore = sinon.spy(nodeHistoryUtil, 'restore');
        await controller.reload(null, false);

        sinon.assert.notCalled(stubRestore);
        stubRestore.restore();
    });

    it('should consider nodeHistoryType=group', async () => {
        const controller = getController({
            nodeHistoryId: 'GROUP_NODE_HISTORY_ID',
            nodeTypeProperty: 'nodeType',
            nodeHistoryType: 'group'
        });

        const stubRestore = sinon.stub(nodeHistoryUtil, 'restore').callsFake((key: any) => Promise.resolve(undefined));
        const stubStore = sinon.stub(nodeHistoryUtil, 'store').callsFake((items: CrudEntityKey[], key: string) => {
            return Promise.resolve(true);
        });

        await controller.reload(null, true);

        controller.setExpandedItems([0, 3]);
        controller.updateExpandedItemsInUserStorage();

        sinon.assert.calledWith(stubStore, [0], 'GROUP_NODE_HISTORY_ID');
        stubStore.restore();
        stubRestore.restore();
    });

    it('should consider nodeHistoryType=node', async () => {
        const controller = getController({
            nodeHistoryId: 'ONLY_NODE_HISTORY_ID',
            nodeTypeProperty: 'nodeType',
            nodeHistoryType: 'node'
        });

        const stubRestore = sinon.stub(nodeHistoryUtil, 'restore').callsFake((key: any) => Promise.resolve(undefined));
        const stubStore = sinon.stub(nodeHistoryUtil, 'store').callsFake((items: CrudEntityKey[], key: string) => {
            return Promise.resolve(true);
        });

        await controller.reload(null, true);

        controller.setExpandedItems([0, 3]);
        controller.updateExpandedItemsInUserStorage();

        sinon.assert.calledWith(stubStore, [3], 'ONLY_NODE_HISTORY_ID');
        stubStore.restore();
        stubRestore.restore();
    });

    it('should store groups without an error if data was changed', async () => {
        const controller = getController({
            nodeHistoryId: 'CHANGE_DATA_HISTORY_ID',
            nodeTypeProperty: 'nodeType'
        });

        const stubRestore = sinon.stub(nodeHistoryUtil, 'restore').callsFake((key: any) => Promise.resolve(undefined));
        // Возвращаем id групп, которых нет в текущем списке.
        const stubGetCached = sinon.stub(nodeHistoryUtil, 'getCached').callsFake((key: any) => [0, 3, 6]);
        const stubStore = sinon.stub(nodeHistoryUtil, 'store').callsFake((items: CrudEntityKey[], key: string) => {
            return Promise.resolve(true);
        });

        await controller.reload(null, true);

        controller.setExpandedItems([0, 3, 6, 7]);
        controller.updateExpandedItemsInUserStorage();

        sinon.assert.calledWith(stubStore, [0, 6], 'CHANGE_DATA_HISTORY_ID');
        stubStore.restore();
        stubGetCached.restore();
        stubRestore.restore();
    });
});
