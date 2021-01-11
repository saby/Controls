import {NewSourceController, ISourceControllerOptions} from 'Controls/dataSource';
import {Memory, PrefetchProxy, DataSet} from 'Types/source';
import {ok, deepStrictEqual} from 'assert';
import {RecordSet} from 'Types/collection';
import {INavigationPageSourceConfig, INavigationOptionValue} from 'Controls/interface';
import {createSandbox, stub} from 'sinon';
import {default as groupUtil} from 'Controls/_dataSource/GroupUtil';

const filterByEntries = (item, filter): boolean => {
    return filter.entries ? filter.entries.get('marked').includes(String(item.get('key'))) : true;
};

const filterByRoot = (item, filter): boolean => {
    return item.get('parent') === filter.parent;
};

const items = [
    {
        key: 0,
        title: 'Sasha'
    },
    {
        key: 1,
        title: 'Dmitry'
    },
    {
        key: 2,
        title: 'Aleksey'
    },
    {
        key: 3,
        title: 'Aleksey'
    }
];

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

function getMemory(additionalOptions: object = {}): Memory {
    const options = {
        data: items,
        keyProperty: 'key'
    };
    return new Memory({...options, ...additionalOptions});
}

function getPrefetchProxy(): PrefetchProxy {
    return new PrefetchProxy({
        target: getMemory(),
        data: {
            query: new DataSet({
                rawData: items.slice(0, 2),
                keyProperty: 'key'
            })
        }
    });
}

function getControllerOptions(): ISourceControllerOptions {
    return {
        source: getMemory(),
        filter: {},
        keyProperty: 'key'
    };
}

function getControllerWithHierarchyOptions(): ISourceControllerOptions {
    return {
        source: getMemoryWithHierarchyItems(),
        parentProperty: 'parent',
        filter: {},
        keyProperty: 'key'
    };
}

function getMemoryWithHierarchyItems(): Memory {
    return new Memory({
        data: hierarchyItems,
        keyProperty: 'key',
        filter: filterByEntries
    });
}

function getPagingNavigation(hasMore: boolean = false, pageSize: number = 1): INavigationOptionValue<INavigationPageSourceConfig> {
    return {
        source: 'page',
        sourceConfig: {
            pageSize,
            page: 0,
            hasMore
        }
    };
}

function getControllerWithHierarchy(additionalOptions: object = {}): NewSourceController {
    return new NewSourceController({...getControllerWithHierarchyOptions(), ...additionalOptions});
}

function getController(additionalOptions: object = {}): NewSourceController {
    return new NewSourceController({...getControllerOptions(), ...additionalOptions});
}

describe('Controls/dataSource:SourceController', () => {

    describe('getState', () => {
        it('getState after create controller', () => {
            const root = 'testRoot';
            const parentProperty = 'testParentProperty';
            let hierarchyOptions;
            let controller;
            let controllerState;

            hierarchyOptions = {
                root,
                parentProperty
            };
            controller = new NewSourceController(hierarchyOptions);
            controllerState = controller.getState();
            ok(controllerState.parentProperty === parentProperty);
            ok(controllerState.root === root);

            hierarchyOptions = {
                parentProperty
            };
            controller = new NewSourceController(hierarchyOptions);
            controllerState = controller.getState();
            ok(controllerState.parentProperty === parentProperty);
            ok(controllerState.root === null);
        });
    });

    describe('load', () => {

        it('load with parentProperty',  async () => {
            const controller = getControllerWithHierarchy();
            const loadedItems = await controller.load();
            ok((loadedItems as RecordSet).getCount() === 5);
        });

        it('load call while loading',  async () => {
            const controller = getController();
            let loadPromiseWasCanceled = false;

            controller.load().catch(() => {
                loadPromiseWasCanceled = true;
            });

            await controller.load();
            ok(loadPromiseWasCanceled);
        });

        it('load with parentProperty and selectedKeys',  async () => {
            let controller = getControllerWithHierarchy({
                selectedKeys: [0],
                excludedKeys: []
            });
            let loadedItems = await controller.load();
            ok((loadedItems as RecordSet).getCount() === 1);

            controller = getControllerWithHierarchy({
                selectedKeys: [0]
            });
            loadedItems = await controller.load();
            ok((loadedItems as RecordSet).getCount() === 1);
        });

        it('load with prefetchProxy in options',  async () => {
            const controller = getController({
                source: getPrefetchProxy(),
                navigation: {
                    source: 'page',
                    sourceConfig: {
                        pageSize: 2,
                        hasMore: false
                    }
                }
            });

            let loadedItems = await controller.load();
            ok((loadedItems as RecordSet).getCount() === 2);
            ok((loadedItems as RecordSet).at(0).get('title') === 'Sasha');

            loadedItems = await controller.load('down');
            ok((loadedItems as RecordSet).getCount() === 2);
            ok((loadedItems as RecordSet).at(0).get('title') === 'Aleksey');
        });

        it('load with collapsedGroups',  async () => {
            const controller = getController({
                source: getMemory({
                    filter: (item, filter) => filter.myFilterField
                }),
                filter: {
                    myFilterField: 'myFilterFieldValue'
                },
                groupProperty: 'groupProperty',
                groupHistoryId: 'groupHistoryId'
            });
            const sinonSandbox = createSandbox();
            sinonSandbox.replace(groupUtil, 'restoreCollapsedGroups', () => {
                return Promise.resolve([]);
            });

            const loadedItems = await controller.reload();
            ok(loadedItems.getCount() === 4);
            sinonSandbox.restore();
        });

        it('load call with direction update items',  async () => {
            const controller = getController({
                navigation: {
                    source: 'page',
                    sourceConfig: {
                        pageSize: 2,
                        hasMore: false
                    }
                }
            });

            await controller.load();
            ok(controller.getItems().getCount() === 2);
            ok(controller.getItems().at(0).get('title') === 'Sasha');

            await controller.load('down');
            ok(controller.getItems().getCount() === 4);
            ok(controller.getItems().at(2).get('title') === 'Aleksey');
        });

        it('load with multiNavigation and without extendedItems',  async () => {
            const pageSize = 3;
            const navigation = getPagingNavigation(false, pageSize);
            navigation.sourceConfig.multiNavigation = true;
            const controller = getController({...getControllerOptions(), navigation});
            const loadedItems = await controller.reload();
            ok((loadedItems as RecordSet).getCount() === pageSize);
        });
    });

    describe('cancelLoading', () => {
        it('query is canceled after cancelLoading',   () => {
            const controller = getController();

            controller.load();
            ok(controller.isLoading());

            controller.cancelLoading();
            ok(!controller.isLoading());
        });

        it('query is canceled async', async () => {
            const controller = getController();
            const loadPromise = controller.load();

            controller._loadPromise.cancel();
            await loadPromise.catch(() => {});

            ok(controller._loadPromise);
        });
    });

    describe('updateOptions', () => {
        it('updateOptions with root',  async () => {
            const controller = getControllerWithHierarchy();
            let options = {...getControllerWithHierarchyOptions()};
            let isChanged;
            options.root = 'testRoot';

            isChanged = controller.updateOptions(options);
            ok(controller._root === 'testRoot');
            ok(isChanged);

            options = {...options};
            options.root = undefined;
            isChanged = controller.updateOptions(options);
            ok(controller._root === 'testRoot');
            ok(!isChanged);
        });

        it('updateOptions with expandedItems',  async () => {
            const controller = getControllerWithHierarchy();
            let options = {...getControllerWithHierarchyOptions()};

            options.expandedItems = [];
            controller.updateOptions(options);
            deepStrictEqual(controller._expandedItems, []);

            options = {...options};
            options.expandedItems = ['testRoot'];
            controller.updateOptions(options);
            deepStrictEqual(controller._expandedItems, ['testRoot']);

            options = {...options};
            delete options.expandedItems;
            controller.updateOptions(options);
            deepStrictEqual(controller._expandedItems, ['testRoot']);
        });

        it('updateOptions with navigationParamsChangedCallback',  async () => {
            let isNavigationParamsChangedCallbackCalled = false;
            const controller = getController({
                navigation: getPagingNavigation(),
                navigationParamsChangedCallback: () => {
                    isNavigationParamsChangedCallbackCalled = true;
                }
            });
            await controller.reload();
            ok(isNavigationParamsChangedCallbackCalled);

            controller.updateOptions({
                ...getControllerOptions(),
                navigation: getPagingNavigation()
            });
            isNavigationParamsChangedCallbackCalled = false;
            await controller.reload();
            ok(isNavigationParamsChangedCallbackCalled);
        });
    });

    describe('reload', () => {
        it('reload should recreate navigation controller',  async () => {
            const controller = getController({
                navigation: getPagingNavigation(false)
            });
            const items = await controller.reload();
            controller.setItems(items as RecordSet);

            const controllerDestroyStub = stub(controller._navigationController, 'destroy');
            await controller.reload();
            ok(controllerDestroyStub.calledOnce);
        });
    });

    describe('setItems', () => {

        it('navigationController is recreated on setItems', () => {
            const controller = getController({
                navigation: getPagingNavigation(true)
            });
            controller.setItems(new RecordSet({
                rawData: items,
                keyProperty: 'key'
            }));
            const controllerDestroyStub = stub(controller._navigationController, 'destroy');

            controller.setItems(new RecordSet({
                rawData: items,
                keyProperty: 'key'
            }));
            ok(controllerDestroyStub.calledOnce);
        });

        it('navigation is updated before assign items', () => {
            const controller = getController({
                navigation: getPagingNavigation(true)
            });
            controller.setItems(new RecordSet({
                rawData: items,
                keyProperty: 'key'
            }));
            const controllerItems = controller.getItems();

            let hasMoreResult;
            controllerItems.subscribe('onCollectionChange', () => {
                hasMoreResult = controller.hasMoreData('down');
            });

            let newControllerItems = controllerItems.clone();
            newControllerItems.setMetaData({
                more: false
            });
            controller.setItems(newControllerItems);
            ok(!hasMoreResult);

            newControllerItems = controllerItems.clone();
            newControllerItems.setMetaData({
                more: true
            });
            controller.setItems(newControllerItems);
            ok(hasMoreResult);
        });

    });
});
