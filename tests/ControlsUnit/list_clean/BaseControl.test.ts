import {assert} from 'chai';
import {BaseControl} from 'Controls/list';
import {IEditableList} from 'Controls/_baseList/interface/IEditableList';
import {RecordSet} from 'Types/collection';
import {Memory, PrefetchProxy, DataSet} from 'Types/source';
import {NewSourceController} from 'Controls/dataSource';
import * as sinon from 'sinon';
import {Logger} from 'UI/Utils';
import {CssClassesAssert as aAssert} from 'ControlsUnit/CustomAsserts';
import {fetch, HTTPStatus} from 'Browser/Transport';

const getData = (dataCount: number = 0) => {
    const data = [];

    for (let i = 0; i < dataCount; i++) {
        data.push({
            key: i,
            title: 'title' + i
        });
    }

    return data;
};

function getBaseControlOptionsWithEmptyItems(): object {
    return {
        viewName: 'Controls/List/ListView',
        keyProperty: 'id',
        viewModelConstructor: 'Controls/display:Collection',
        source: new Memory()
    };
}

function getCorrectBaseControlConfig(cfg): object {
    let sourceController;

    if (cfg.source) {
        sourceController = new NewSourceController({
            source: cfg.source,
            keyProperty: cfg.keyProperty || cfg.source.getKeyProperty(),
            navigation: cfg.navigation,
            sorting: cfg.sorting
        });

        if (cfg.source._$data) {
            sourceController.setItems(new RecordSet({
                rawData: cfg.source._$data,
                keyProperty: cfg.keyProperty || cfg.source.getKeyProperty()
            }));
        }

        cfg.sourceController = sourceController;
    }

    return cfg;
}

async function getCorrectBaseControlConfigAsync(cfg): Promise<object> {
    // Эмулируем, что в baseControl передан sourceController
    let sourceController;
    if (cfg.source) {
        sourceController = new NewSourceController({
            source: cfg.source,
            keyProperty: cfg.keyProperty || cfg.source.getKeyProperty(),
            navigation: cfg.navigation,
            sorting: cfg.sorting,
            root: cfg.root !== undefined ? cfg.root : null
        });

        await sourceController.load();
        cfg.sourceController = sourceController;
    }

    return cfg;
}

describe('Controls/list_clean/BaseControl', () => {
    describe('BaseControl watcher groupHistoryId', async () => {

        const GROUP_HISTORY_ID_NAME: string = 'MY_NEWS';

        const baseControlCfg = await getCorrectBaseControlConfigAsync({
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: 'Controls/display:Collection',
            source: new Memory()
        });
        let baseControl;

        beforeEach(() => {
            baseControl = new BaseControl(baseControlCfg);
        });

        afterEach(() => {
            baseControl.destroy();
            baseControl = undefined;
        });

        it('CollapsedGroup empty', () => {
            baseControl._beforeMount(baseControlCfg);
            baseControl._container = {getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}])};
            baseControl._afterMount();
            assert.isFalse(!!baseControl._listViewModel.getCollapsedGroups()?.length);
        });
        it('is CollapsedGroup', () => {
            const cfgClone = {...baseControlCfg};
            // cfgClone.groupHistoryId = GROUP_HISTORY_ID_NAME;
            cfgClone.collapsedGroups = [];
            baseControl._beforeMount(cfgClone);
            baseControl._container = {getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}])};
            baseControl._afterMount();
            assert.isTrue(!!baseControl._listViewModel.getCollapsedGroups());
        });
        it('updated CollapsedGroups', async () => {
            const cfgClone = {...baseControlCfg};
            baseControl.saveOptions(baseControlCfg);
            await baseControl._beforeMount(baseControlCfg);
            baseControl._beforeUpdate(baseControlCfg);
            baseControl._afterUpdate(baseControlCfg);
            baseControl._container = {getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}])};
            cfgClone.groupHistoryId = GROUP_HISTORY_ID_NAME;
            cfgClone.collapsedGroups = [];
            baseControl._beforeUpdate(cfgClone);
            assert.isTrue(!!baseControl._listViewModel.getCollapsedGroups());
        });
    });
    describe('handleKeyDown', async() => {
        const baseControlCfg = await getCorrectBaseControlConfigAsync({
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: 'Controls/display:Collection',
            source: new Memory()
        });
        let baseControl;

        beforeEach(() => {
            baseControl = new BaseControl(baseControlCfg);
        });

        afterEach(() => {
            baseControl.destroy();
            baseControl = undefined;
        });
        it('skip event if altKey', () => {
            const eventAlt = { nativeEvent: { altKey: true, keyCode: 40} };
            const event = {
                nativeEvent: {
                    altKey: false,
                    keyCode: 40
                },
                stopImmediatePropagation: () => null,
                target: {
                    closest: () => {
                        return true;
                    }
                }
            };
            const sandbox = sinon.createSandbox();
            let keyDownDownCalled = false;
            sandbox.stub(BaseControl._private, 'keyDownDown').callsFake(() => {
                keyDownDownCalled = true;
            });
            baseControl.handleKeyDown(eventAlt);
            assert.isFalse(keyDownDownCalled);
            baseControl.handleKeyDown(event);
            assert.isTrue(keyDownDownCalled);
            sandbox.restore();
        });
    });
    describe('BaseControl watcher paging', () => {
        const baseControlCfg = getCorrectBaseControlConfig({
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: 'Controls/display:Collection',
            source: new Memory({
                keyProperty: 'id',
                data: []
            }),
            navigation: {
                view: 'infinity',
                viewConfig: {
                    pagingMode: 'page'
                }
            }
        });
        let baseControl;

        beforeEach(() => {
            baseControl = new BaseControl(baseControlCfg);
            baseControl._children = {
                scrollObserver: { startRegister: () => null }
            };
        });

        afterEach(() => {
            baseControl.destroy();
            baseControl = undefined;
        });

        it('is _pagingVisible', async () => {
            baseControl.saveOptions(baseControlCfg);
            await baseControl._beforeMount(baseControlCfg);
            baseControl._beforeUpdate(baseControlCfg);
            baseControl._afterUpdate(baseControlCfg);
            baseControl._afterRender();
            baseControl._container = {
                getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}]),
                clientHeight: 800
            };
            assert.isFalse(baseControl._pagingVisible);
            baseControl._viewportSize = 200;
            baseControl._viewSize = 800;
            baseControl._mouseEnter(null);
            assert.isTrue(baseControl._pagingVisible);
            await BaseControl._private.onScrollHide(baseControl);
            assert.isFalse(baseControl._pagingVisible, 'Wrong state _pagingVisible after scrollHide');
            BaseControl._private.handleListScrollSync(baseControl, 200);
            assert.isTrue(baseControl._pagingVisible);
        });
        it('is viewport = 0', async () => {
            baseControl.saveOptions(baseControlCfg);
            await baseControl._beforeMount(baseControlCfg);
            baseControl._beforeUpdate(baseControlCfg);
            baseControl._afterUpdate(baseControlCfg);
            baseControl._afterRender();
            baseControl._container = {getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}])};
            assert.isFalse(baseControl._pagingVisible);
            baseControl._viewportSize = 0;
            baseControl._viewSize = 800;
            baseControl._mouseEnter(null);
            assert.isFalse(baseControl._pagingVisible);
        });

        it('update navigation', async () => {
            baseControl.saveOptions(baseControlCfg);
            await baseControl._beforeMount(baseControlCfg);
            baseControl._beforeUpdate(baseControlCfg);
            baseControl._afterUpdate(baseControlCfg);
            baseControl._afterRender();
            baseControl._container = {getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}])};
            assert.isFalse(baseControl._pagingVisible);
            baseControl._viewportSize = 200;
            baseControl._viewSize = 800;
            baseControl._mouseEnter(null);
            assert.isTrue(baseControl._pagingVisible);
            const cloneBaseControlCfg = {...baseControlCfg};
            cloneBaseControlCfg.navigation = {
                view: 'infinity',
                viewConfig: null
            };
            baseControl._beforeUpdate(cloneBaseControlCfg);
            assert.isFalse(baseControl._pagingVisible);
        });

        it('viewSize resize', async () => {
            baseControl.saveOptions(baseControlCfg);
            await baseControl._beforeMount(baseControlCfg);
            baseControl._afterMount();
            baseControl._beforeUpdate(baseControlCfg);
            baseControl._afterUpdate(baseControlCfg);
            baseControl._afterRender();
            baseControl._container = {
                clientHeight: 1000,
                getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}]),
                getBoundingClientRect: () => ([{clientHeight: 100, offsetHeight: 0}])
            };
            baseControl._getItemsContainer = () => {
                return {
                    children: [],
                    querySelectorAll: () => []
                };
            };
            assert.isFalse(baseControl._pagingVisible);
            baseControl._viewportSize = 400;
            baseControl._viewSize = 800;
            baseControl._mouseEnter(null);
            assert.isTrue(baseControl._pagingVisible);

            baseControl._container.clientHeight = 1000;
            baseControl._viewResize();
            assert.isTrue(baseControl._pagingVisible);

            baseControl._container.clientHeight = 200;
            baseControl._viewResize();
            assert.isFalse(baseControl._pagingVisible);
        });
    });
    describe('BaseControl paging', () => {
        const baseControlCfg = getCorrectBaseControlConfig({
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: 'Controls/display:Collection',
            items: new RecordSet({
                keyProperty: 'id',
                rawData: []
            }),
            navigation: {
                view: 'infinity',
                viewConfig: {
                    pagingMode: 'basic',
                    showEndButton: false
                }
            }
        });
        let baseControl;
        const heightParams = {
            scrollHeight: 1000,
            clientHeight: 400,
            scrollTop: 0
        };

        beforeEach(() => {
            baseControl = new BaseControl(baseControlCfg);
        });
        afterEach(() => {
            baseControl.destroy();
            baseControl = undefined;
        });

        it('paging mode is basic', async () => {
            const cfgClone = {...baseControlCfg};
            baseControl.saveOptions(cfgClone);
            await baseControl._beforeMount(cfgClone);
            baseControl._container = {
                clientHeight: 1000
            };
            baseControl._itemsContainerReadyHandler(null, () => {
                return {children: [],
                    querySelectorAll: () => []};
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._getItemsContainer = () => {
                return {children: [],
                    querySelectorAll: () => []};
            };
            baseControl._mouseEnter(null);

            // эмулируем появление скролла
            await baseControl.canScrollHandler(heightParams);
            baseControl._updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isTrue(!!baseControl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');

            baseControl.scrollMoveSyncHandler({scrollTop: 200});
            assert.deepEqual(
                {
                    begin: 'visible',
                    end: 'hidden',
                    next: 'visible',
                    prev: 'visible'
                }, baseControl._pagingCfg.arrowState);

            baseControl.scrollMoveSyncHandler({scrollTop: 640});
            assert.deepEqual({
                begin: 'visible',
                end: 'hidden',
                next: 'readonly',
                prev: 'visible'
            }, baseControl._pagingCfg.arrowState);
        });

        it('paging mode is basic showEndButton true', async () => {
            const cfgClone = {...baseControlCfg};
            cfgClone.navigation.viewConfig.showEndButton = true;
            baseControl.saveOptions(cfgClone);
            await baseControl._beforeMount(cfgClone);
            baseControl._container = {
                clientHeight: 1000
            };
            baseControl._itemsContainerReadyHandler(null, () => {
                return {children: [],
                    querySelectorAll: () => []};
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._getItemsContainer = () => {
                return {children: [],
                    querySelectorAll: () => []};
            };
            baseControl._mouseEnter(null);

            // эмулируем появление скролла
            await baseControl.canScrollHandler(heightParams);
            baseControl._updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isTrue(!!baseControl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');

            baseControl.scrollMoveSyncHandler({scrollTop: 200});
            assert.deepEqual(
                {
                    begin: 'visible',
                    end: 'visible',
                    next: 'visible',
                    prev: 'visible'
                }, baseControl._pagingCfg.arrowState);
        });

        it('paging mode is edge', async () => {
            const cfgClone = {...baseControlCfg};
            cfgClone.navigation.viewConfig.pagingMode = 'edge';
            baseControl.saveOptions(cfgClone);
            await baseControl._beforeMount(cfgClone);
            baseControl._container = {
                clientHeight: 1000
            };
            baseControl._itemsContainerReadyHandler(null, () => {
                return {children: [],
                    querySelectorAll: () => []};
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._getItemsContainer = () => {
                return {children: [],
                    querySelectorAll: () => []};
            };
            baseControl._mouseEnter(null);

            // эмулируем появление скролла
            await baseControl.canScrollHandler(heightParams);
            baseControl._updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isTrue(!!baseControl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');

            baseControl.scrollMoveSyncHandler({scrollTop: 200});
            assert.deepEqual({
                begin: 'hidden',
                end: 'visible',
                next: 'hidden',
                prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);

            baseControl.scrollMoveSyncHandler({scrollTop: 800});
            assert.deepEqual({
                begin: 'visible',
                end: 'hidden',
                next: 'hidden',
                prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);
        });

        it('paging mode is end', async () => {
            const cfgClone = {...baseControlCfg};
            cfgClone.navigation.viewConfig.pagingMode = 'end';
            baseControl.saveOptions(cfgClone);
            await baseControl._beforeMount(cfgClone);
            baseControl._container = {
                clientHeight: 1000
            };
            baseControl._itemsContainerReadyHandler(null, () => {
                return {children: [],
                    querySelectorAll: () => []};
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._getItemsContainer = () => {
                return {children: [],
                    querySelectorAll: () => []};
            };
            baseControl._mouseEnter(null);

            // эмулируем появление скролла
            await baseControl.canScrollHandler(heightParams);
            baseControl._updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isTrue(!!baseControl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');

            baseControl.scrollMoveSyncHandler({scrollTop: 200});
            assert.deepEqual({
                begin: 'hidden',
                end: 'visible',
                next: 'hidden',
                prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);

            baseControl.scrollMoveSyncHandler({scrollTop: 800});
            assert.deepEqual({
                begin: 'hidden',
                end: 'hidden',
                next: 'hidden',
                prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);
        });

        it('paging mode is end scroll to end', async () => {
            const cfgClone = {...baseControlCfg};
            cfgClone.navigation.viewConfig.pagingMode = 'end';
            baseControl.saveOptions(cfgClone);
            await baseControl._beforeMount(cfgClone);
            baseControl._container = {
                clientHeight: 1040
            };
            baseControl._itemsContainerReadyHandler(null, () => {
                return {children: [],
                    querySelectorAll: () => []};
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._getItemsContainer = () => {
                return {children: [],
                    querySelectorAll: () => []};
            };
            baseControl._mouseEnter(null);

            // эмулируем появление скролла
            await baseControl.canScrollHandler(heightParams);
            baseControl._updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isTrue(!!baseControl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');

            baseControl.scrollMoveSyncHandler({scrollTop: 200});
            assert.deepEqual({
                begin: 'hidden',
                end: 'visible',
                next: 'hidden',
                prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);

            baseControl.scrollMoveSyncHandler({scrollTop: 600});
            assert.deepEqual({
                begin: 'hidden',
                end: 'visible',
                next: 'hidden',
                prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);
            baseControl.scrollMoveSyncHandler({scrollTop: 640});
            assert.deepEqual({
                begin: 'hidden',
                end: 'hidden',
                next: 'hidden',
                prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);

            cfgClone.navigation.viewConfig.pagingMode = 'edge';
            baseControl._pagingVisible = false;
            baseControl._mouseEnter(null);
            baseControl.scrollMoveSyncHandler({scrollTop: 200});
            assert.deepEqual({
                begin: 'hidden',
                end: 'visible',
                next: 'hidden',
                prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);

            baseControl.scrollMoveSyncHandler({scrollTop: 600});
            assert.deepEqual({
                begin: 'hidden',
                end: 'visible',
                next: 'hidden',
                prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);
        });

        it('paging mode is numbers', async () => {
            let cfgClone = {...baseControlCfg};
            cfgClone.navigation.viewConfig.pagingMode = 'numbers';
            cfgClone.navigation.sourceConfig = {
                pageSize: 100,
                page: 0,
                hasMore: false
            };
            cfgClone.source = new Memory({
                keyProperty: 'id',
                data: getData(1000)
            });
            cfgClone = await getCorrectBaseControlConfigAsync(cfgClone);
            let expectedScrollTop = 400;
            await baseControl._beforeMount(cfgClone);
            baseControl.saveOptions(cfgClone);

            baseControl._container = {
                clientHeight: 1000
            };
            baseControl._sourceController = {
                getAllDataCount: () => 1000,
                hasMoreData: () => false
            };
            baseControl._listViewModel.getStopIndex = () => 100;
            baseControl._viewportSize = 400;
            baseControl._getItemsContainer = () => {
                return {children: [],
                    querySelectorAll: () => []};
            };
            baseControl._mouseEnter(null);
            let doScrollNotified = false;
            let notifiedScrollTop = null;
            baseControl._notify = (event, args) => {
                if (event === 'doScroll') {
                    doScrollNotified = true;
                    notifiedScrollTop = args[0];
                }
            };

            // эмулируем появление скролла
            await BaseControl._private.onScrollShow(baseControl, heightParams);
            baseControl._updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isTrue(!!baseControl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');

            assert.equal(baseControl._pagingCfg.pagesCount, 25);

            BaseControl._private.handleListScrollSync(baseControl, 100);
            assert.deepEqual({
                begin: 'visible',
                end: 'visible',
                next: 'hidden',
                prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);

            assert.equal(baseControl._currentPage, 1);
            expectedScrollTop = 400;
            await baseControl.__selectedPageChanged(null, 2);
            assert.equal(baseControl._currentPage, 2);
            assert.isTrue(doScrollNotified);
            doScrollNotified = false;
            assert.equal(notifiedScrollTop, expectedScrollTop);
            expectedScrollTop = 800;
            assert.isNull(baseControl._applySelectedPage);
            await baseControl.__selectedPageChanged(null, 3);
            assert.equal(baseControl._currentPage, 2);
            assert.isOk(baseControl._applySelectedPage);
            baseControl._container.clientHeight = 1500;
            await baseControl._viewResize();
            baseControl._applySelectedPage();
        });

        it('visible paging padding', async () => {
            const cfgClone = {...baseControlCfg};
            cfgClone.navigation.viewConfig.pagingMode = 'end';
            baseControl.saveOptions(cfgClone);
            await baseControl._beforeMount(cfgClone);
            baseControl._container = {
                clientHeight: 1000
            };
            baseControl._viewportSize = 400;
            baseControl._getItemsContainer = () => {
                return {children: [],
                    querySelectorAll: () => []};
            };
            assert.isFalse(baseControl._isPagingPadding());
            cfgClone.navigation.viewConfig.pagingMode = 'base';
            await baseControl._beforeUpdate(cfgClone);
            assert.isTrue(baseControl._isPagingPadding());

            cfgClone.navigation.viewConfig.pagingPadding = 'null';
            await baseControl._beforeUpdate(cfgClone);
            assert.isFalse(baseControl._isPagingPadding());
        });

        it('paging mode is edge + eip', async () => {
            const cfgClone = {...baseControlCfg};
            cfgClone.navigation.viewConfig.pagingMode = 'edge';
            baseControl.saveOptions(cfgClone);
            await baseControl._beforeMount(cfgClone);
            baseControl._container = {
                clientHeight: 1000
            };
            baseControl._viewportSize = 400;
            baseControl._getItemsContainer = () => {
                return {children: [],
                    querySelectorAll: () => []};
            };
            baseControl._mouseEnter(null);
            assert.isTrue(baseControl._pagingVisible);
            const item = {
                contents: {
                    unsubscribe: () => {
                        return '';
                    },
                    subscribe: () => {
                        return '';
                    }
                }
            };
            // Эмулируем начало редактирования
            await baseControl._afterBeginEditCallback(item, false);
            baseControl._editInPlaceController = {isEditing: () => true};
            assert.isFalse(baseControl._pagingVisible);
            baseControl._mouseEnter(null);
            assert.isFalse(baseControl._pagingVisible);

            baseControl._afterEndEditCallback(item, false);
            baseControl._editInPlaceController.isEditing = () => {
                return false;
            };
            baseControl._mouseEnter(null);
            assert.isTrue(baseControl._pagingVisible);
        });

        it('paging getScrollParams', async () => {
            const cfgClone = {...baseControlCfg};
            cfgClone.navigation.viewConfig.pagingMode = 'edge';
            baseControl.saveOptions(cfgClone);
            await baseControl._beforeMount(cfgClone);
            baseControl._container = {
                clientHeight: 1000
            };
            baseControl._itemsContainerReadyHandler(null, () => {
                return {children: [],
                    querySelectorAll: () => []};
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._mouseEnter(null);
            await baseControl.canScrollHandler(heightParams);
            assert.isTrue(baseControl._pagingVisible);
            baseControl._scrollController.getPlaceholders = () => {
                return {top: 100, bottom: 100};
            };
            const scrollParams = {
                scrollTop: 100,
                scrollHeight: 1200,
                clientHeight: 400
            };
            assert.deepEqual(baseControl._getScrollParams(baseControl), scrollParams);
            scrollParams.scrollTop = 500;
            baseControl.scrollMoveSyncHandler({scrollTop: 400});
            assert.deepEqual(baseControl._getScrollParams(baseControl), scrollParams);
            scrollParams.scrollTop = 0;
            scrollParams.scrollHeight = 1000;

            baseControl.scrollMoveSyncHandler({scrollTop: scrollParams.scrollTop});
            baseControl.__onPagingArrowClick(null, '');
            assert.deepEqual(baseControl._getScrollParams(baseControl), scrollParams);

            scrollParams.scrollTop = 100;
            scrollParams.scrollHeight = 1200;
            baseControl.scrollMoveSyncHandler({scrollTop: 0});
            cfgClone.navigation.viewConfig.pagingMode = 'numbers';
            assert.deepEqual(baseControl._getScrollParams(baseControl), scrollParams);
            baseControl.scrollMoveSyncHandler({scrollTop: 400});
            scrollParams.scrollTop = 500;
            assert.deepEqual(baseControl._getScrollParams(baseControl), scrollParams);
        });
    });
    describe('beforeUnmount', () => {
        let baseControl;
        const baseControlCfg = getCorrectBaseControlConfig({
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: 'Controls/display:Collection',
            items: new RecordSet({
                keyProperty: 'id',
                rawData: []
            })
        });
        beforeEach(() => {
            baseControl = new BaseControl(baseControlCfg);
        });
        afterEach(() => {
            baseControl.destroy();
            baseControl = undefined;
        });
        it('reset editInPlace before model', async () => {
            let eipReset = false;
            let modelDestroyed = false;

            baseControl.saveOptions(baseControlCfg);
            await baseControl._beforeMount(baseControlCfg);
            baseControl._editInPlaceController = {
                destroy: () => {
                    assert.isFalse(modelDestroyed, 'model is destroyed before editInPlace');
                    eipReset = true;
                }
            };
            baseControl._listViewModel.destroy = () => {
                modelDestroyed = true;
            };
            baseControl._items = {
                unsubscribe: () => true
            };
            baseControl._beforeUnmount();
            assert.isTrue(eipReset, 'editInPlace is not reset');
            assert.isTrue(modelDestroyed, 'model is not destroyed');
        });
    });

    describe('baseControl with searchValue in options', () => {
        it('searchValue is changed in _beforeUpdate', async () => {
            let baseControlOptions = getBaseControlOptionsWithEmptyItems();
            let loadStarted = false;
            const navigation = {
                view: 'infinity',
                source: 'page',
                sourceConfig: {
                    pageSize: 10,
                    page: 0,
                    hasMore: false
                }
            };
            baseControlOptions.navigation = navigation;
            baseControlOptions.sourceController = new NewSourceController({
                source: new Memory(),
                navigation,
                keyProperty: 'key'
            });
            baseControlOptions.sourceController.hasMoreData = () => true;
            await baseControlOptions.sourceController.load();
            baseControlOptions.sourceController.load = () => {
                loadStarted = true;
                return Promise.reject();
            };

            const baseControl = new BaseControl(baseControlOptions);
            await baseControl._beforeMount(baseControlOptions);
            baseControl.saveOptions(baseControlOptions);

            baseControl._items.setMetaData({more: true, iterative: true});
            baseControlOptions = {...baseControlOptions};
            baseControlOptions.searchValue = 'testSearchValue';
            baseControl._beforeUpdate(baseControlOptions);
            assert.isTrue(loadStarted);
        });

        it('pagingNavigation and searchValue is changed in _beforeUpdate', async () => {
            let baseControlOptions = getBaseControlOptionsWithEmptyItems();
            let loadStarted = false;
            baseControlOptions.sourceController = new NewSourceController({
                source: new Memory(),
                keyProperty: 'key'
            });
            baseControlOptions.sourceController.hasMoreData = () => true;
            baseControlOptions.sourceController.reload = () => {
                loadStarted = true;
                return Promise.reject();
            };

            const baseControl = new BaseControl(baseControlOptions);
            await baseControl._beforeMount(baseControlOptions);
            baseControl._sourceController = baseControlOptions.sourceController;
            baseControl.saveOptions(baseControlOptions);

            baseControlOptions = {...baseControlOptions};
            baseControl._pagingNavigation = true;
            baseControlOptions.searchValue = 'testSearchValue';
            loadStarted = false;
            baseControl._beforeUpdate(baseControlOptions);
            assert.isFalse(loadStarted);

            baseControlOptions.searchValue = 'testSearchValue';
            baseControlOptions.filter = 'testFilter';
            baseControl._beforeUpdate(baseControlOptions);
            assert.isFalse(loadStarted);
        });

        it('search returns empty recordSet with iterative in meta', async () => {
            let baseControlOptions = getBaseControlOptionsWithEmptyItems();
            let loadStarted = false;
            const navigation = {
                view: 'infinity',
                source: 'page',
                sourceConfig: {
                    pageSize: 10,
                    page: 0,
                    hasMore: false
                }
            };

            baseControlOptions.navigation = navigation;
            baseControlOptions.sourceController = new NewSourceController({
                source: new Memory(),
                navigation,
                keyProperty: 'key'
            });
            baseControlOptions.sourceController.hasMoreData = () => true;
            baseControlOptions.sourceController.load = () => {
                loadStarted = true;
                return Promise.reject();
            };
            baseControlOptions.sourceController.getItems = () => {
                const rs = new RecordSet();
                rs.setMetaData({iterative: true});
                return rs;
            };
            baseControlOptions.searchValue = 'test';
            baseControlOptions.loading = true;
            const baseControl = new BaseControl(baseControlOptions);
            await baseControl._beforeMount(baseControlOptions);
            baseControl.saveOptions(baseControlOptions);

            loadStarted = false;
            baseControlOptions = {...baseControlOptions};
            baseControlOptions.loading = false;
            baseControl._beforeUpdate(baseControlOptions);
            assert.isTrue(loadStarted);
        });
    });

    describe('_beforeMount', () => {
        it('_beforeMount with prefetchProxy', async () => {
            let baseControlOptions = getBaseControlOptionsWithEmptyItems();
            baseControlOptions.source = new PrefetchProxy({
                target: new Memory(),
                data: {
                    query: new DataSet()
                }
            });
            baseControlOptions = await getCorrectBaseControlConfigAsync(baseControlOptions);
            const baseControl = new BaseControl(baseControlOptions);
            const mountResult = await baseControl._beforeMount(baseControlOptions);
            assert.isTrue(!mountResult);
        });
        it('_beforeMount keyProperty', async () => {
            let baseControlOptions = await getCorrectBaseControlConfigAsync({
                source: new Memory({
                    keyProperty: 'keyProperty',
                    data: []
                }),
                viewModelConstructor: 'Controls/display:Collection'
            });

            let baseControl = new BaseControl(baseControlOptions);
            await baseControl._beforeMount(baseControlOptions);
            assert.equal(baseControl._keyProperty, 'keyProperty');

            baseControlOptions = {...baseControlOptions};
            baseControlOptions.keyProperty = 'keyPropertyOptions';
            baseControlOptions = await getCorrectBaseControlConfigAsync(baseControlOptions);
            baseControl = new BaseControl(baseControlOptions);
            await baseControl._beforeMount(baseControlOptions);
            assert.equal(baseControl._keyProperty, 'keyPropertyOptions');

            baseControlOptions = {...baseControlOptions};
            baseControlOptions.source = null;
            baseControlOptions.sourceController = null;
            baseControlOptions = await getCorrectBaseControlConfigAsync(baseControlOptions);
            baseControl = new BaseControl(baseControlOptions);
            await baseControl._beforeMount(baseControlOptions);
            assert.equal(baseControl._keyProperty, 'keyPropertyOptions');

            const loggerErrorStub = sinon.stub(Logger, 'error');
            baseControlOptions = {...baseControlOptions};
            baseControlOptions.keyProperty = undefined;
            baseControlOptions = await getCorrectBaseControlConfigAsync(baseControlOptions);
            baseControl = new BaseControl(baseControlOptions);
            await baseControl._beforeMount(baseControlOptions);
            assert.isFalse(!!baseControl._keyProperty);
            assert.ok(loggerErrorStub.calledOnce);
            loggerErrorStub.restore();
        });

        it('_beforeMount returns errorConfig', async () => {
            const baseControlOptions = {...getBaseControlOptionsWithEmptyItems(),
                sourceController: new NewSourceController({
                    source: new Memory({
                        keyProperty: 'keyProperty',
                        data: []
                    }),
                    keyProperty: 'id'
                })
            };
            const baseControl = new BaseControl(baseControlOptions);
            baseControlOptions.sourceController._loadError = new Error('test error');
            const receivedState = await baseControl._beforeMount(baseControlOptions);
            assert.ok(receivedState.hasOwnProperty('errorConfig'));
        });

        it('_beforeMount with items in options', async () => {
            const items = new RecordSet({
                rawData: getData(10)
            });
            const baseControlOptions = {
                ...getBaseControlOptionsWithEmptyItems(),
                items
            };
            const baseControl = new BaseControl(baseControlOptions);
            await baseControl._beforeMount(baseControlOptions);
            baseControl.saveOptions(baseControlOptions);

            assert.ok(baseControl.getItems() === items);
        });
    });

    describe('setMarkerAfterScroll', () => {
        const baseControlCfg = getCorrectBaseControlConfig({
            viewName: 'Controls/List/ListView',
            keyProperty: 'key',
            viewModelConstructor: 'Controls/display:Collection',
            multiSelectVisibility: 'visible',
            markerVisibility: 'visible',
            selectedKeys: [],
            excludedKeys: [],
            markedKey: 0,
            source: new Memory({
                keyProperty: 'key',
                data: getData(0)
            })
        });
        let baseControl;
        let changeMarkedKeyStub;
        beforeEach(() => {
            baseControl = new BaseControl(baseControlCfg);
            baseControl._beforeMount(baseControlCfg);
            baseControl.saveOptions(baseControlCfg);
            baseControl._children = {
                listView: {
                    getItemsContainer: () => {}
                }
            };

            changeMarkedKeyStub = sinon.stub(baseControl, '_changeMarkedKey').callsFake(() => Promise.resolve());
        });
        afterEach(() => {
            changeMarkedKeyStub.restore();
            baseControl.destroy();
            baseControl = undefined;
        });
        it('without items', () => {
            BaseControl._private.setMarkerAfterScrolling(baseControl, 0);
            assert.isFalse(changeMarkedKeyStub.called);
        });
    });

    describe('shiftToDirection by moving marker', () => {
        const baseControlCfg = getCorrectBaseControlConfig({
            viewName: 'Controls/List/ListView',
            keyProperty: 'key',
            viewModelConstructor: 'Controls/display:Collection',
            multiSelectVisibility: 'visible',
            markerVisibility: 'visible',
            selectedKeys: [],
            excludedKeys: [],
            markedKey: 0,
            source: new Memory({
                keyProperty: 'key',
                data: getData(2)
            })
        });
        let baseControl;
        let shiftToDirectionStub;
        beforeEach(() => {
            baseControl = new BaseControl(baseControlCfg);
            baseControl._beforeMount(baseControlCfg);
            baseControl.saveOptions(baseControlCfg);

            shiftToDirectionStub = sinon.stub(baseControl, '_shiftToDirection').callsFake(() => Promise.resolve());
        });
        afterEach(() => {
            shiftToDirectionStub.restore();
            baseControl.destroy();
            baseControl = undefined;
        });
        it('space', () => {
            BaseControl._private.spaceHandler(baseControl, { preventDefault: () => null });
            assert.isFalse(shiftToDirectionStub.called);
            baseControl._beforeUpdate({...baseControlCfg, markedKey: 1});
            BaseControl._private.spaceHandler(baseControl, { preventDefault: () => null });
            assert.isTrue(shiftToDirectionStub.calledOnce);
            assert.isTrue(shiftToDirectionStub.calledWith('down'));
        });
        it('moveMarkerToNext', () => {
            BaseControl._private.moveMarkerToDirection(baseControl, { preventDefault: () => null }, 'Forward');
            assert.isFalse(shiftToDirectionStub.called);
            baseControl._beforeUpdate({...baseControlCfg, markedKey: 1});
            BaseControl._private.moveMarkerToDirection(baseControl, { preventDefault: () => null }, 'Forward');
            assert.isTrue(shiftToDirectionStub.calledOnce);
            assert.isTrue(shiftToDirectionStub.calledWith('down'));
        });
        it('moveMarkerToPrevious', () => {
            BaseControl._private.moveMarkerToDirection(baseControl, { preventDefault: () => null }, 'Backward');
            assert.isTrue(shiftToDirectionStub.calledOnce);
            assert.isTrue(shiftToDirectionStub.calledWith('up'));
        });
    });

    describe('Edit in place', () => {
        type TEditingConfig = IEditableList['_options']['editingConfig'];

        const baseControlCfg = getCorrectBaseControlConfig({
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: 'Controls/display:Collection',
            items: new RecordSet({
                keyProperty: 'id',
                rawData: []
            })
        });
        let baseControl;

        beforeEach(() => {
            baseControl = new BaseControl(baseControlCfg);
        });
        afterEach(() => {
            baseControl.destroy();
            baseControl = undefined;
        });

        it('should cancel edit on changes that leads to reload', async () => {
            await baseControl._beforeMount(baseControlCfg);
            baseControl.saveOptions(baseControlCfg);
            let isEditingCancelled = false;
            baseControl._editInPlaceController = {
                cancel() {
                    isEditingCancelled = true;
                    return Promise.resolve();
                },
                isEditing() {
                    return true;
                },
                updateOptions() {
                }
            };

            baseControl._beforeUpdate({
                ...baseControlCfg,
                filter: {field: 'ASC'},
                loading: true
            });
            assert.isTrue(isEditingCancelled);
        });

        it('should immediately resolve promise if cancel edit called without eipController', () => {
            let isCancelCalled = false;
            baseControl.getEditInPlaceController = () => ({
                cancel() {
                    isCancelCalled = true;
                }
            });
            return baseControl.cancelEdit().then(() => {
                assert.isFalse(isCancelCalled);
            });
        });

        it('should immediately resolve promise if commit edit called without eipController', () => {
            let isCommitCalled = false;
            baseControl.getEditInPlaceController = () => ({
                commit() {
                    isCommitCalled = true;
                }
            });
            return baseControl.commitEdit().then(() => {
                assert.isFalse(isCommitCalled);
            });
        });

        describe('readOnly mode', () => {
            beforeEach(() => {
                baseControl.saveOptions({...baseControlCfg, readOnly: true});
            });
            describe('should reject promises of edit in place operations', () => {
                ['beginEdit', 'beginAdd', 'cancelEdit', 'commitEdit'].forEach((methodName) => {
                    it(methodName, () => {
                        return baseControl[methodName]().catch(() => {
                            return 'Rejected';
                        }).then((result) => {
                            assert.equal(result, 'Rejected');
                        });
                    });
                });
            });
        });

        describe('editing config', () => {
            it('if autoAddByApplyButton not setted it should be the same as autoAdd', () => {
                const options = {
                    editingConfig: {
                        autoAdd: true
                    }
                };
                let editingConfig: TEditingConfig;

                editingConfig = baseControl._getEditingConfig(options);
                assert.isTrue(editingConfig.autoAdd);
                assert.isTrue(editingConfig.autoAddByApplyButton);

                options.editingConfig.autoAdd = false;

                editingConfig = baseControl._getEditingConfig(options);
                assert.isFalse(editingConfig.autoAdd);
                assert.isFalse(editingConfig.autoAddByApplyButton);
            });

            describe('autoAddByApplyButton setted', () => {
                const options: IEditableList['_options'] = {
                    editingConfig: {}
                };
                let editingConfig: TEditingConfig;

                it('should be true', () => {
                    options.editingConfig.autoAddByApplyButton = true;
                    options.editingConfig.autoAdd = true;
                    editingConfig = baseControl._getEditingConfig(options);
                    assert.isTrue(editingConfig.autoAdd);
                    assert.isTrue(editingConfig.autoAddByApplyButton);
                });

                it('autoAddByApplyButton should be false, autoAdd true', () => {
                    options.editingConfig.autoAdd = true;
                    options.editingConfig.autoAddByApplyButton = false;
                    editingConfig = baseControl._getEditingConfig(options);
                    assert.isTrue(editingConfig.autoAdd);
                    assert.isFalse(editingConfig.autoAddByApplyButton);
                });

                it('autoAddByApplyButton should be true, autoAdd false', () => {
                    options.editingConfig.autoAdd = false;
                    options.editingConfig.autoAddByApplyButton = true;
                    editingConfig = baseControl._getEditingConfig(options);
                    assert.isFalse(editingConfig.autoAdd);
                    assert.isTrue(editingConfig.autoAddByApplyButton);
                });
            });

        });

        describe('_beforeUpdate sourceController', () => {

            it('sourceController load error', async () => {
                let sourceControllerOptions = getBaseControlOptionsWithEmptyItems();
                const sourceController = new NewSourceController(sourceControllerOptions);
                let baseControlOptions = {...sourceControllerOptions, sourceController};
                const baseControl = new BaseControl(baseControlOptions);
                await sourceController.reload();
                await baseControl._beforeMount(baseControlOptions);
                baseControl.saveOptions(baseControlOptions);

                sourceControllerOptions = {...sourceControllerOptions};
                sourceControllerOptions.source = new Memory();
                sourceControllerOptions.source.query = () => {
                    const error = new Error();
                    error.processed = true;
                    return Promise.reject(error);
                };
                sourceController.updateOptions(sourceControllerOptions);
                await sourceController.reload().catch(() => {});
                baseControlOptions.source = new Memory();
                baseControlOptions.loading = true;
                assert.doesNotThrow(() => {
                    baseControl._beforeUpdate(baseControlOptions);
                    baseControl.saveOptions(baseControlOptions);
                });

                baseControl.__error = {testErrorField: 'testErrorValue'};
                sourceControllerOptions = {...sourceControllerOptions};
                sourceControllerOptions.source = new Memory();
                sourceController.updateOptions(sourceControllerOptions);
                await sourceController.reload();
                baseControlOptions = {...baseControlOptions};
                baseControlOptions.source = new Memory();
                baseControlOptions.loading = false;
                baseControl._beforeUpdate(baseControlOptions);
                assert.ok(!baseControl.__error);
            });

            it('sourceController load error on _beforeUpdate', async () => {
                let sourceControllerOptions = getBaseControlOptionsWithEmptyItems();
                const sourceController = new NewSourceController(sourceControllerOptions);
                let baseControlOptions = {...sourceControllerOptions, sourceController};
                const baseControl = new BaseControl(baseControlOptions);
                await sourceController.reload();
                await baseControl._beforeMount(baseControlOptions);
                baseControl.saveOptions(baseControlOptions);

                sourceControllerOptions = {...sourceControllerOptions};
                sourceControllerOptions.source = new Memory();
                sourceControllerOptions.source.query = () => {
                    const error = new fetch.Errors.HTTP({
                        httpError: HTTPStatus.GatewayTimeout,
                        message: undefined,
                        url: undefined
                    });
                    error.processed = true;
                    return Promise.reject(error);
                };
                sourceController.updateOptions(sourceControllerOptions);
                await sourceController.reload().catch(() => {});
                baseControlOptions.loading = true;
                baseControl.saveOptions(baseControlOptions);

                baseControlOptions = {...baseControlOptions};
                baseControlOptions.loading = false;
                const errorResult = await baseControl._beforeUpdate(baseControlOptions);
                assert.ok(errorResult.error);
            });

            it('_beforeUpdate while source controller is loading', async () => {
                let baseControlOptions = getBaseControlOptionsWithEmptyItems();
                let loadStarted = false;

                baseControlOptions.sourceController = new NewSourceController(baseControlOptions);
                baseControlOptions.sourceController.reload = () => {
                    loadStarted = true;
                    return Promise.reject();
                };

                const baseControl = new BaseControl(baseControlOptions);
                await baseControl._beforeMount(baseControlOptions);
                baseControl._sourceController = baseControlOptions.sourceController;
                baseControl.saveOptions(baseControlOptions);

                const newSourceControllerOptions = {...baseControlOptions};
                newSourceControllerOptions.source = new Memory();
                baseControlOptions.sourceController.updateOptions(newSourceControllerOptions);
                baseControlOptions.sourceController.load();

                loadStarted = false;
                baseControlOptions = {...baseControlOptions};
                baseControlOptions.filter = 'testFilter';
                baseControl._beforeUpdate(baseControlOptions);
                assert.isFalse(loadStarted);
            });

            it('_beforeUpdate with new source should reset scroll', async () => {
                let baseControlOptions = getBaseControlOptionsWithEmptyItems();
                baseControlOptions.sourceController = new NewSourceController(baseControlOptions);

                const baseControl = new BaseControl(baseControlOptions);
                await baseControl._beforeMount(baseControlOptions);
                baseControl.saveOptions(baseControlOptions);

                const newSourceControllerOptions = {...baseControlOptions};
                newSourceControllerOptions.source = new Memory();

                baseControl._beforeUpdate(newSourceControllerOptions);
                assert.isFalse(baseControl._resetScrollAfterReload);
            });

            it('_beforeMount without source and sourceController, then _beforeUpdate with sourceController', async () => {
                let baseControlOptions = getBaseControlOptionsWithEmptyItems();
                let afterReloadCallbackCalled = false;
                baseControlOptions.source = null;
                baseControlOptions.sourceController = null;

                const sandbox = sinon.createSandbox();
                const baseControl = new BaseControl(baseControlOptions);
                sandbox.stub(baseControl, '_afterReloadCallback').callsFake(() => {
                    afterReloadCallbackCalled = true;
                });
                await baseControl._beforeMount(baseControlOptions);
                baseControl.saveOptions(baseControlOptions);

                assert.isFalse(afterReloadCallbackCalled);

                baseControlOptions = {...baseControlOptions};
                baseControlOptions.source = new Memory();
                baseControlOptions.sourceController = new NewSourceController(baseControlOptions);

                await baseControl._beforeUpdate(baseControlOptions);
                baseControl._updateInProgress = false;
                baseControl.saveOptions(baseControlOptions);
                assert.isTrue(afterReloadCallbackCalled);

                baseControlOptions = {...baseControlOptions};
                baseControlOptions.sourceController = new NewSourceController(baseControlOptions);
                afterReloadCallbackCalled = false;
                await baseControl._beforeUpdate(baseControlOptions);
                baseControl.saveOptions(baseControlOptions);
                assert.isTrue(afterReloadCallbackCalled);
                sandbox.restore();
            });

        });

        it('should immediately resolve promise if commit edit called without eipController', () => {
            let isCommitCalled = false;
            baseControl.getEditInPlaceController = () => ({
                commit() {
                    isCommitCalled = true;
                }
            });
            return baseControl.commitEdit().then(() => {
                assert.isFalse(isCommitCalled);
            });
        });

        describe('should force cancel editing on reload from parent (by API)', () => {
            let stubReload;
            let isCancelCalled = false;

            beforeEach(() => {
                stubReload = sinon.stub(baseControl, '_reload').callsFake(() => Promise.resolve());
                baseControl._editInPlaceController = {
                    isEditing: () => true
                };
                baseControl._cancelEdit = (force) => {
                    isCancelCalled = true;
                    assert.isTrue(force);
                    return Promise.resolve();
                };
            });
            afterEach(() => {
                stubReload.restore();
                isCancelCalled = false;
            });

            it('should cancel if reload called not on beforeBeginEdit', () => {
                baseControl._editInPlaceController.isEndEditProcessing = () => false;

                return baseControl.reload().then(() => {
                    assert.isTrue(isCancelCalled);
                    assert.isTrue(stubReload.calledOnce);
                });
            });

            it('should not cancel if reload called  on beforeBeginEdit', () => {
                baseControl._editInPlaceController.isEndEditProcessing = () => true;

                return baseControl.reload().then(() => {
                    assert.isFalse(isCancelCalled);
                    assert.isTrue(stubReload.called);
                });
            });
        });
    });

    describe('reload', () => {

        it('baseControl destroyed on reload', async () => {
            const options = await getCorrectBaseControlConfigAsync(getBaseControlOptionsWithEmptyItems());
            let afterReloadCallbackCalled = false;
            options.afterReloadCallback = () => {
                afterReloadCallbackCalled = true;
            };
            const baseControl = new BaseControl(options);
            await baseControl._beforeMount(options);
            baseControl.saveOptions(options);
            afterReloadCallbackCalled = false;
            const reloadPromise = baseControl.reload();
            baseControl._beforeUnmount();
            baseControl._destroyed = true;

            const reloadPromiseResult = await reloadPromise;
            assert.ok(!reloadPromiseResult, 'reload return wrong result');
            assert.ok(!afterReloadCallbackCalled);
        });

        it('baseControl items not changed on reload', async () => {
            const options = getBaseControlOptionsWithEmptyItems();
            let itemsReadyCallbackCalled = false;
            options.itemsReadyCallback = () => {
                itemsReadyCallbackCalled = true;
            };
            const options = await getCorrectBaseControlConfigAsync(options);
            const baseControl = new BaseControl(options);
            await baseControl._beforeMount(options);
            baseControl.saveOptions(options);
            assert.ok(itemsReadyCallbackCalled);

            itemsReadyCallbackCalled = false;
            await baseControl.reload();
            assert.ok(!itemsReadyCallbackCalled);
        });

    });

    describe('getFooterClasses', () => {
        [
            // multiSelectVisibility, multiSelectPosition, itemPadding, expectedResult
            ['hidden', 'default', undefined, undefined, 'controls__BaseControl__footer-default__paddingLeft_default'],
            ['hidden', 'default', undefined, {}, 'controls__BaseControl__footer-default__paddingLeft_default'],
            ['hidden', 'default', undefined, {left: 'xl'}, 'controls__BaseControl__footer-default__paddingLeft_xl'],
            ['hidden', 'default', undefined, {left: 'XL'}, 'controls__BaseControl__footer-default__paddingLeft_xl'],

            ['visible', 'default', undefined, undefined, 'controls__BaseControl__footer-default__paddingLeft_withCheckboxes'],
            ['visible', 'default', undefined, {left: 'xl'}, 'controls__BaseControl__footer-default__paddingLeft_withCheckboxes'],

            ['visible', 'default', 'custom', undefined, 'controls__BaseControl__footer-default__paddingLeft_default'],
            ['visible', 'default', 'custom', {left: 'xl'}, 'controls__BaseControl__footer-default__paddingLeft_xl'],
            ['visible', 'default', 'custom', {left: 'XL'}, 'controls__BaseControl__footer-default__paddingLeft_xl']
        ].forEach(([multiSelectVisibility, style,  multiSelectPosition, itemPadding, expectedResult]) => {
            it(`multiSelectVisibility='${multiSelectVisibility}', style='${style}', multiSelectPosition='${multiSelectPosition}', itemPadding='${itemPadding}'`, () => {
                const baseControl = new BaseControl({});

                aAssert.isSame(
                    baseControl._getFooterClasses({ multiSelectVisibility, style, multiSelectPosition, itemPadding }),
                    `controls__BaseControl__footer ${expectedResult}`
                );
            });
        });
    });

    it('needFooterPadding', () => {
        let editing = false;
        let count = 10;
        let footer = false;
        let results = false;
        let resultsPosition = '';

        const fakeInstance = {
            _listViewModel: {
                isEditing: () => editing,
                getCount: () => count,
                getFooter: () => footer,
                getResults: () => results,
                getResultsPosition: () => resultsPosition
            },
            _shouldDrawFooter: false
        } as unknown as BaseControl;

        assert.isFalse(
            BaseControl._private.needBottomPadding(fakeInstance, {itemActionsPosition: 'inside'}),
            'itemActionsPosition is inside, padding is not needed'
        );

        assert.isTrue(
            BaseControl._private.needBottomPadding(fakeInstance, {itemActionsPosition: 'outside'}),
            'itemActionsPosition is outside, padding is needed'
        );

        fakeInstance._shouldDrawFooter = true;
        assert.isFalse(
            BaseControl._private.needBottomPadding(fakeInstance, {itemActionsPosition: 'outside'}),
            'itemActionsPosition is outside and "hasMore" button visible, no padding needed'
        );
        fakeInstance._shouldDrawFooter = false;

        footer = true;
        assert.isFalse(
            BaseControl._private.needBottomPadding(fakeInstance, {itemActionsPosition: 'outside'}),
            'itemActionsPosition is outside, footer exists, padding is not needed'
        );
        footer = false;

        results = true;
        resultsPosition = 'bottom';
        assert.isFalse(
            BaseControl._private.needBottomPadding(fakeInstance, {itemActionsPosition: 'outside'}),
            'itemActionsPosition is outside, results row is in bottom padding is not needed'
        );
        results = false;
        resultsPosition = '';

        count = 0;
        assert.isFalse(
            BaseControl._private.needBottomPadding(fakeInstance, {itemActionsPosition: 'outside'}),
            'itemActionsPosition is outside, empty items, padding is not needed'
        );

        editing = true;
        assert.isTrue(
            BaseControl._private.needBottomPadding(fakeInstance, {itemActionsPosition: 'outside'}),
            'itemActionsPosition is outside, empty items, run editing in place padding is needed'
        );
        editing = false;
    });
});
