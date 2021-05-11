import {assert} from 'chai';
import * as sinon from 'sinon';
import {ISourceControllerOptions, NewSourceController} from 'Controls/dataSource';
import {nodeHistoryUtil} from '../../../Controls/_dataSource/nodeHistoryUtil';
import {Memory} from 'Types/source';

const hierarchyItems = [
    {
        key: 0,
        title: 'Интерфейсный фреймворк',
        parent: null
    },
    {
        key: 1,
        title: 'Sasha',
        parent: 0
    },
    {
        key: 2,
        title: 'Dmitry',
        parent: 0
    },
    {
        key: 3,
        title: 'Склад',
        parent: null
    },
    {
        key: 4,
        title: 'Michail',
        parent: 3
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
        filter: {},
        keyProperty: 'key'
    };
}

function getController(additionalOptions: object = {}): NewSourceController {
    return new NewSourceController({...getControllerWithHierarchyOptions(), ...additionalOptions});
}

describe('Controls/dataSource/Controller/NodeHistoryId', () => {
    // 1. Если !expandedItems && options.nodeHistoryId то дёргаем History При загрузке
    it('should call restore from history method', () => {
        const sinonSandbox = sinon.createSandbox();
        const controller = getController({
            expandedItems: undefined,
            nodeHistoryId: 'NODE_HISTORY_ID'
        });

        sinonSandbox.replace(nodeHistoryUtil, 'restore', (id) => {
            assert.equal(id, 'NODE_HISTORY_ID');
            return Promise.resolve([1]);
        });

        return controller.load(null, 0);
        sinonSandbox.restore();
    });

    // 2. Если expandedItems && options.nodeHistoryId то не дёргаем History При загрузке
    it('should not call restore from history method when expandedItems', async () => {
        const controller = getController({
            expandedItems: [1],
            nodeHistoryId: 'NODE_HISTORY_ID'
        });
        const spyRestore = sinon.spy(nodeHistoryUtil, 'restore');
        await controller.load(null, 0);

        sinon.assert.notCalled(spyRestore);
        spyRestore.restore();
    });

    // 3. Если !expandedItems && !options.nodeHistoryId то не дёргаем History При загрузке
    it('should not call restore from history method when expandedItems', async () => {
        const controller = getController({
            expandedItems: [1],
            nodeHistoryId: undefined
        });
        const stubRestore = sinon.spy(nodeHistoryUtil, 'restore');
        await controller.load(null, 0);

        sinon.assert.notCalled(stubRestore);
        stubRestore.restore();
    });
});
