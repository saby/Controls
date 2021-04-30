import {NewSourceController, ISourceControllerOptions} from 'Controls/dataSource';
import {Memory, PrefetchProxy, DataSet} from 'Types/source';
import {ok, deepStrictEqual} from 'assert';
import {RecordSet} from 'Types/collection';
import {adapter} from 'Types/entity';
import {INavigationPageSourceConfig, INavigationOptionValue} from 'Controls/interface';
import {createSandbox, stub, useFakeTimers} from 'sinon';
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

const sourceWithError = new Memory();
sourceWithError.query = () => {
    const error = new Error();
    error.processed = true;
    return Promise.reject(error);
};

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
            ok(!controllerState.keyProperty);

            hierarchyOptions = {
                parentProperty,
                source: new Memory({
                    keyProperty: 'testKeyProperty'
                })
            };
            controller = new NewSourceController(hierarchyOptions);
            controllerState = controller.getState();
            ok(controllerState.parentProperty === parentProperty);
            ok(controllerState.root === null);
            ok(controllerState.keyProperty === 'testKeyProperty');
        });
    });

    describe('load', () => {

        it('load with parentProperty',  async () => {
            const controller = getControllerWithHierarchy();
            const loadedItems = await controller.load();
            ok((loadedItems as RecordSet).getCount() === 5);
        });

        it('load with direction "down"',  async () => {
            const controller  = getController();
            await controller.load('down');
            ok(controller.getItems().getCount() === 4);
        });

        it('load without direction',  async () => {
            const controller = getControllerWithHierarchy({
                navigation: getPagingNavigation()
            });
            await controller.reload();
            await controller.load(undefined, 3);
            ok(controller.hasLoaded(3));

            await controller.load();
            ok(!controller.hasLoaded(3));
        });

        it('load call while loading',  async () => {
            const controller = getController();
            let loadPromiseWasCanceled = false;

            const promiseCanceled = controller.load().catch(() => {
                loadPromiseWasCanceled = true;
            });

            await controller.load();
            await promiseCanceled;
            ok(loadPromiseWasCanceled);
        });

        it('load call while preparing filter', async () => {
            return new Promise((resolve) => {
                const navigation = getPagingNavigation();
                let navigationParamsChangedCallbackCalled = false;
                const options = {...getControllerOptions(), navigation};
                options.navigationParamsChangedCallback = () => {
                    navigationParamsChangedCallbackCalled = true;
                };
                const controller = getController(options);

                const reloadPromise = controller.reload();
                controller.cancelLoading();
                reloadPromise.finally(() => {
                    ok(!navigationParamsChangedCallbackCalled);
                    resolve();
                });
            });
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

            sinonSandbox.replace(groupUtil, 'restoreCollapsedGroups', () => {
                return Promise.resolve(['testCollapsedGroup1', 'testCollapsedGroup2']);
            });
            await controller.reload();
            deepStrictEqual(controller.getCollapsedGroups(), ['testCollapsedGroup1', 'testCollapsedGroup2']);

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

        it('load with root in arguments and deepReload, expandedItems in options',  async () => {
            const controller = getController({
                navigation: {
                    source: 'page',
                    sourceConfig: {
                        pageSize: 2,
                        hasMore: false
                    }
                },
                source: new Memory({
                    keyProperty: 'key',
                    data: hierarchyItems,
                    filter: filterByRoot
                }),
                parentProperty: 'parent',
                deepReload: true,
                expandedItems: [3]
            });

            await controller.load(null, 0);
            ok(controller.getItems().getCount() === 2);
        });

        it('load with multiNavigation and without extendedItems',  async () => {
            const pageSize = 3;
            const navigation = getPagingNavigation(false, pageSize);
            navigation.sourceConfig.multiNavigation = true;
            const controller = getController({...getControllerOptions(), navigation});
            const loadedItems = await controller.reload();
            ok((loadedItems as RecordSet).getCount() === pageSize);
        });

        it('load with dataLoadCallback in options',  async () => {
            let dataLoadCallbackCalled = false;
            const controller = getController({
                dataLoadCallback: () => {
                    dataLoadCallbackCalled = true;
                }
            });
            await controller.load();
            ok(dataLoadCallbackCalled);
        });

        it('load with dataLoadCallback from setter',  async () => {
            let dataLoadCallbackCalled = false;
            const controller = getController();
            controller.setDataLoadCallback(() => {
                dataLoadCallbackCalled = true;
            });
            await controller.load();
            ok(dataLoadCallbackCalled);
        });

        it('load any root with dataLoadCallback from setter',  async () => {
            let dataLoadCallbackCalled = false;
            const controller = getController();
            controller.setDataLoadCallback(() => {
                dataLoadCallbackCalled = true;
            });
            await controller.load(null, 'testRoot');
            ok(!dataLoadCallbackCalled);

            await controller.load('down', 'testRoot');
            ok(!dataLoadCallbackCalled);
        });

        it('dataLoadCallback from setter returns promise',  async () => {
            const controller = getController();
            let promiseResolver;

            const promise = new Promise((resolve) => {
                promiseResolver = resolve;
            });
            controller.setDataLoadCallback(() => {
                return promise;
            });
            const reloadPromise = controller.reload().then(() => {
                ok(controller.getItems().getCount() === 4);
            });
            promiseResolver();
            await reloadPromise;
        });

        it('load with direction returns error',  () => {
            const navigation = getPagingNavigation();
            let options = {...getControllerOptions(), navigation};
            const controller = getController(options);
            return controller.reload().then(() => {
                ok(controller.getItems().getCount() === 1);
                //mock error
                const originSource = controller._options.source;
                options = {...options};
                options.source = sourceWithError;
                controller.updateOptions(options);

                return controller.load('down').catch(() => {
                    ok(controller.getItems().getCount() === 1);

                    //return originSource
                    options = {...options};
                    options.source = originSource;
                    controller.updateOptions(options);
                    return controller.load('down').then(() => {
                        ok(controller.getItems().getCount() === 2);
                    });
                });
            });
        });

        it('load timeout error',  () => {
            const options = getControllerOptions();
            options.loadTimeout = 10;
            options.source.query = () => {
                return new Promise((resolve) => {
                   setTimeout(resolve, 100);
                });
            };
            const controller = getController(options);
            return controller.load().catch((error) => {
                ok(error.status === 504);
            });
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

        it('updateOptions with new sorting',  async () => {
            let controllerOptions = getControllerOptions();
            controllerOptions.sorting = [{testField: 'DESC'}];
            const controller = getController(controllerOptions);

            // the same sorting
            controllerOptions = {...controllerOptions};
            controllerOptions.sorting = [{testField: 'DESC'}];
            ok(!controller.updateOptions(controllerOptions));

            // another sorting
            controllerOptions = {...controllerOptions};
            controllerOptions.sorting = [{testField: 'ASC'}];
            ok(controller.updateOptions(controllerOptions));
        });
    });

    describe('expandedItems in options', () => {
        it('updateOptions with expandedItems',  async () => {
            const controller = getControllerWithHierarchy();
            let options = {...getControllerWithHierarchyOptions()};

            options.expandedItems = [];
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), []);

            options = {...options};
            options.expandedItems = ['testRoot'];
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), ['testRoot']);

            options = {...options};
            delete options.expandedItems;
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), ['testRoot']);
        });

        it('reset expandedItems on options change',  async () => {
            let options = {...getControllerWithHierarchyOptions()};
            options.expandedItems = ['testRoot'];
            const controller = getControllerWithHierarchy(options);

            deepStrictEqual(controller.getExpandedItems(), ['testRoot']);

            options = {...options};
            options.root = 'testRoot';
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), []);

            controller.setExpandedItems(['testRoot']);
            options = {...options};
            options.filter = {newFilterField: 'newFilterValue'};
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), []);
        });

        it('expandedItems is [null]',  async () => {
            let options = {...getControllerWithHierarchyOptions()};
            options.expandedItems = [null];
            const controller = getControllerWithHierarchy(options);

            deepStrictEqual(controller.getExpandedItems(), [null]);

            options = {...options};
            options.filter = {newFilterField: 'newFilterValue'};
            controller.updateOptions(options);
            deepStrictEqual(controller.getExpandedItems(), [null]);
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

        it('different items format', () => {
            const items = new RecordSet({
                adapter: new adapter.Sbis(),
                format: [
                    { name: 'testName', type: 'string' }
                ]
            });
            const otherItems = new RecordSet({
                adapter: new adapter.Sbis(),
                format: [
                    { name: 'testName2', type: 'string' }
                ]
            });
            const controller = getController();

            controller.setItems(items);
            ok(controller.getItems() === items);

            controller.setItems(otherItems);
            ok(controller.getItems() === otherItems);
        });

    });

    describe('getKeyProperty', () => {

        it('keyProperty in options', () => {
            const options = {
                source: new Memory({
                    keyProperty: 'testKeyProperty'
                })
            };
            const sourceController = new NewSourceController(options);
            ok(sourceController.getKeyProperty() === 'testKeyProperty');
        });

        it('keyProperty from source', () => {
            const options = {
                source: new Memory(),
                keyProperty: 'testKeyProperty'
            };
            const sourceController = new NewSourceController(options);
            ok(sourceController.getKeyProperty() === 'testKeyProperty');
        });

    });

    describe('hasMoreData', () => {
        it('hasMoreData for root', async () => {
            const controller = getController({
                navigation: getPagingNavigation(false)
            });
            await controller.reload();
            ok(controller.hasMoreData('down'));
        });

        it('hasMoreData for not loaded folder', async () => {
            const controller = getController({
                navigation: getPagingNavigation(false)
            });
            ok(!controller.hasMoreData('down', 'anyFolderKey'));
            ok(!controller.hasLoaded('anyFolderKey'));
        });
    });

    describe('hasLoaded', () => {
        it('hasLoaded without navigation', async () => {
            const controller = getController();
            controller.setExpandedItems(['anyTestKey']);
            await controller.reload();
            ok(controller.hasLoaded('anyTestKey'));
        });

        it('hasLoaded with navigation', async () => {
            const controller = getController({
                navigation: getPagingNavigation(false)
            });
            ok(!controller.hasLoaded('anyFolderKey'));
        });
    });
});
