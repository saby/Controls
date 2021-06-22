import {DataLoader, ILoadDataResult, ILoadDataConfig, ILoadDataCustomConfig} from 'Controls/dataSource';
import {Memory, PrefetchProxy} from 'Types/source';
import {ok, deepStrictEqual} from 'assert';
import {NewSourceController} from 'Controls/dataSource';
import {createSandbox, useFakeTimers} from 'sinon';
import {default as groupUtil} from 'Controls/_dataSource/GroupUtil';
import {RecordSet} from 'Types/collection';
import {HTTPStatus} from 'Browser/Transport';

function getDataArray(): object[] {
    return [
        {
            id: 0,
            title: 'Sasha'
        },
        {
            id: 1,
            title: 'Sergey'
        },
        {
            id: 2,
            title: 'Dmitry'
        },
        {
            id: 3,
            title: 'Andrey'
        },
        {
            id: 4,
            title: 'Aleksey'
        }
    ];
}

function getSource(): Memory {
    return new Memory({
        data: getDataArray(),
        keyProperty: 'id'
    });
}

function getDataLoader(): DataLoader {
    return new DataLoader();
}

describe('Controls/dataSource:loadData', () => {

    it('loadData', async() => {
        const loadDataConfig = {
            source: getSource()
        };
        const loadDataResult = await getDataLoader().load([loadDataConfig]);

        ok(loadDataResult.length === 1);
        ok(loadDataResult[0].data.getCount() === 5);
        deepStrictEqual(loadDataResult[0].data.getRawData(), getDataArray());
    });

    it('loadData with filter', async () => {
        const loadDataConfig = {
            source: getSource(),
            filter: {
                title: 'Sasha'
            }
        };
        const loadDataResult = await getDataLoader().load([loadDataConfig]);

        ok(loadDataResult.length === 1);
        ok(loadDataResult[0].data.getCount() === 1);
    });

    it('loadData with several configs', async () => {
        const loadDataConfig = {
            source: getSource()
        };
        const loadDataConfigWithFilter = {
            source: getSource(),
            filter: {
                title: 'Sasha'
            }
        };
        const loadDataResult = await getDataLoader().load([loadDataConfig, loadDataConfigWithFilter]);

        ok(loadDataResult.length === 2);
        ok(loadDataResult[0].data.getCount() === 5);
        ok(loadDataResult[1].data.getCount() === 1);
    });

    it('loadData with filterButtonSource', async () => {
        const loadDataConfigWithFilter = {
            type: 'list',
            source: getSource(),
            filter: {},
            filterButtonSource: [
                {
                    name: 'title', value: 'Sasha', textValue: 'Sasha'
                }
            ]
        } as ILoadDataConfig;
        const dataLoader = getDataLoader();
        const loadDataResult = await dataLoader.load<ILoadDataResult>([loadDataConfigWithFilter]);
        const filterController = dataLoader.getFilterController();

        ok(loadDataResult.length === 1);
        ok((loadDataResult[0]).data.getCount() === 1);
        ok(filterController !== filterController._options.filterController);
        deepStrictEqual(
            (loadDataResult[0]).filter,
            {
                title: 'Sasha'
            }
        );
        deepStrictEqual(
            (loadDataResult[0]).filterController.getFilter(),
            {
                title: 'Sasha'
            }
        );
    });

    it('load with custom loader', async () => {
        const loadDataConfigCustomLoader = {
            type: 'custom',
            loadDataMethod: () => Promise.resolve({ testField: 'testValue', historyItems: [] })
        } as ILoadDataCustomConfig;
        const loadDataResult = await getDataLoader().load([loadDataConfigCustomLoader]);

        ok(loadDataResult.length === 1);
        deepStrictEqual(loadDataResult[0], { testField: 'testValue', historyItems: [] });
    });

    it('custom loader returns primitive value', async () => {
        const loadDataConfigCustomLoader = {
            type: 'custom',
            loadDataMethod: () => Promise.resolve(false)
        } as ILoadDataCustomConfig;
        const loadDataResult = await getDataLoader().load([loadDataConfigCustomLoader]);

        ok(loadDataResult.length === 1);
        ok(loadDataResult[0] === false);
    });

    it('load with custom loader (promise rejected)', async () => {
        const loadDataConfigCustomLoader = {
            type: 'custom',
            loadDataMethod: () => Promise.reject({ testField: 'testValue', historyItems: [] })
        } as ILoadDataCustomConfig;
        const loadDataResult = await getDataLoader().load([loadDataConfigCustomLoader]);

        ok(loadDataResult.length === 1);
        deepStrictEqual(loadDataResult[0], { testField: 'testValue', historyItems: [] });
    });

    it('load with filterHistoryLoader', async () => {
        const historyItem = {
            name: 'title', value: 'Sasha', textValue: 'Sasha'
        };
        const loadDataConfigCustomLoader = {
            type: 'list',
            source: getSource(),
            filter: {},
            filterButtonSource: [
                {
                    name: 'title', value: '', textValue: ''
                }
            ],
            filterHistoryLoader: () => Promise.resolve({
                historyItems: [{...historyItem}],
                filter: {
                    city: 'Yaroslavl'
                }
            })
        };
        const loadDataResult = await getDataLoader().load([loadDataConfigCustomLoader]);

        deepStrictEqual(
            (loadDataResult[0] as ILoadDataResult).filter,
            {
                title: 'Sasha',
                city: 'Yaroslavl'
            }
        );
        deepStrictEqual(loadDataResult[0].historyItems, [{...historyItem}]);
    });

    it('loadEvery', async () => {
        const loadDataConfigs = [{source: getSource()}, {source: getSource()}];
        const loadDataPromises = getDataLoader().loadEvery(loadDataConfigs);
        const loadResults = await Promise.all(loadDataPromises);

        ok(loadDataPromises.length === 2);
        ok(loadResults.length === 2);
    });

    it('load data with sourceController in config', async () => {
        const source = getSource();
        const sourceController = new NewSourceController({source});
        const dataLoader = getDataLoader();
        await dataLoader.load([{source, sourceController}]);

        ok(dataLoader.getSourceController() === sourceController);
    });

    it('load data with sourceController and prefetchProxy in config', async () => {
        const source = getSource();
        const rs = new RecordSet({
            rawData: getDataArray()
        });
        const prefetchSource = new PrefetchProxy({
            target: source,
            data: {
                query: rs
            }
        });
        const sourceController = new NewSourceController({source});
        const dataLoader = getDataLoader();
        await dataLoader.load([{source: prefetchSource, sourceController}]);

        ok(dataLoader.getSourceController().getItems() === rs);
    });

    it('load with collapsedGroups', async () => {
        const sinonSandbox = createSandbox();
        const loadDataConfigWithFilter = {
            source: getSource(),
            filter: {},
            groupHistoryId: 'testGroupHistoryId'
        };

        sinonSandbox.replace(groupUtil, 'restoreCollapsedGroups', () => {
            return Promise.resolve(['testCollapsedGroup1', 'testCollapsedGroup2']);
        });
        const loadDataResult = await getDataLoader().load([loadDataConfigWithFilter]);
        deepStrictEqual((loadDataResult[0] as ILoadDataResult).collapsedGroups, ['testCollapsedGroup1', 'testCollapsedGroup2']);
        sinonSandbox.restore();
    });

    it('load with searchValue and searchParam', async () => {
        const loadDataConfigWithFilter = {
            source: getSource(),
            filter: {},
            searchParam: 'title',
            searchValue: 'Sasha',
            minSearchLength: 3
        };

        const loadDataResult = await getDataLoader().load([loadDataConfigWithFilter]);
        ok((loadDataResult[0] as ILoadDataResult).data.getCount() === 1);
    });

    it('load with default load timeout', async () => {
        const fakeTimer = useFakeTimers();
        const source = getSource();
        source.query = () => new Promise(() => {
            Promise.resolve().then(() => {
                fakeTimer.tick(40000);
            });
        });
        const loadDataConfig = {
            source,
            filter: {}
        };

        const dataLoader = getDataLoader();
        const loadDataResult = dataLoader.load([loadDataConfig]);
        return new Promise((resolve) => {
            loadDataResult.then((loadResult ) => {
                ok(loadResult[0].sourceController.getLoadError().status === HTTPStatus.GatewayTimeout);
                resolve();
            });
        });
    });

    it('load with timeout', async () => {
        const fakeTimer = useFakeTimers();
        const source = getSource();
        const loadTimeOut = 5000;
        const queryLoadTimeOut = 10000;
        source.query = () => new Promise(() => {
            Promise.resolve().then(() => {
                fakeTimer.tick(queryLoadTimeOut);
            });
        });
        const loadDataConfig = {
            source,
            filter: {}
        };

        const dataLoader = getDataLoader();
        const loadDataResult = dataLoader.loadEvery([loadDataConfig], loadTimeOut);
        return new Promise((resolve) => {
            Promise.all(loadDataResult).then((loadResult) => {
                ok(loadResult[0].sourceController.getLoadError().status === HTTPStatus.GatewayTimeout);
                resolve();
            });
        });
    });

});
