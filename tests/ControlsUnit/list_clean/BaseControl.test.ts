import {assert} from 'chai';
import {BaseControl, ListViewModel} from 'Controls/list';
import {IEditableListOption} from 'Controls/_list/interface/IEditableList';
import {RecordSet} from 'Types/collection';
import {Memory, PrefetchProxy, DataSet} from 'Types/source';
import {NewSourceController} from 'Controls/dataSource';
import * as sinon from 'sinon';

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
        viewModelConstructor: ListViewModel,
        source: new Memory()
    };
}

describe('Controls/list_clean/BaseControl', () => {
    describe('BaseControl watcher groupHistoryId', () => {

        const GROUP_HISTORY_ID_NAME: string = 'MY_NEWS';

        const baseControlCfg = {
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: ListViewModel,
            items: new RecordSet({
                keyProperty: 'id',
                rawData: []
            })
        };
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
            assert.isFalse(!!baseControl._listViewModel.getCollapsedGroups());
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
    describe('BaseControl watcher paging', () => {
        const baseControlCfg = {
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: ListViewModel,
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
        };
        let baseControl;

        beforeEach(() => {
            baseControl = new BaseControl(baseControlCfg);
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
            baseControl._beforePaint();
            baseControl._container = {getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}])};
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
            baseControl._beforePaint();
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
            baseControl._beforePaint();
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
            baseControl._beforePaint();
            baseControl._container = {
                clientHeight: 1000,
                getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}]),
                getBoundingClientRect: () => ([{clientHeight: 100, offsetHeight: 0}])
            };
            baseControl._getItemsContainer = () => {
                return {
                    children: []
                }
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
        const baseControlCfg = {
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: ListViewModel,
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
        };
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
                return {children: []};
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._getItemsContainer = () => {
                return {children: []};
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
            assert.isFalse(baseControl._pagingCfg.showEndButton);

            baseControl.scrollMoveSyncHandler({scrollTop: 600});
            assert.deepEqual({
                begin: 'visible',
                end: 'readonly',
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
                return {children: []};
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._getItemsContainer = () => {
                return {children: []};
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
            assert.isTrue(baseControl._pagingCfg.showEndButton);
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
                return {children: []};
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._getItemsContainer = () => {
                return {children: []};
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
            assert.isTrue(baseControl._pagingCfg.showEndButton);

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
                return {children: []};
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._getItemsContainer = () => {
                return {children: []};
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
            assert.isTrue(baseControl._pagingCfg.showEndButton);

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
                return {children: []};
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._getItemsContainer = () => {
                return {children: []};
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
            const cfgClone = {...baseControlCfg};
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
            baseControl._listViewModel._startIndex = 0;
            baseControl._listViewModel._stopIndex = 100;
            baseControl._viewportSize = 400;
            baseControl._getItemsContainer = () => {
                return {children: []};
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
            assert.isTrue(baseControl._pagingCfg.showEndButton);

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
                return {children: []};
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
                return {children: []};
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
                return {children: []};
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
        const baseControlCfg = {
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: ListViewModel,
            items: new RecordSet({
                keyProperty: 'id',
                rawData: []
            })
        };
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
            baseControlOptions.sourceController.load = () => {
                loadStarted = true;
                return Promise.reject();
            };

            const baseControl = new BaseControl(baseControlOptions);
            await baseControl._beforeMount(baseControlOptions);
            baseControl.saveOptions(baseControlOptions);

            baseControl._items.setMetaData({more: true});
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
            baseControlOptions.useNewModel = true;
            baseControl._pagingNavigation = true;
            baseControlOptions.searchValue = 'testSearchValue';
            loadStarted = false;
            baseControl._beforeUpdate(baseControlOptions);
            assert.isFalse(loadStarted);

            baseControlOptions.searchValue = 'testSearchValue';
            baseControlOptions.filter = 'testFilter';
            baseControl._beforeUpdate(baseControlOptions);
            assert.isFalse(loadStarted);

            baseControlOptions.searchValue = undefined;
            baseControlOptions.filter = 'testFilter';
            baseControl._beforeUpdate(baseControlOptions);
            assert.isTrue(loadStarted, 'searchValue is not changed');
        });

        it('portioned search is started after sourceController load without searchValue', async () => {
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

            const baseControl = new BaseControl(baseControlOptions);
            await baseControl._beforeMount(baseControlOptions);
            baseControl.saveOptions(baseControlOptions);

            baseControlOptions = {...baseControlOptions};
            baseControlOptions.source = new Memory();
            baseControl._beforeUpdate(baseControlOptions);
            assert.isTrue(loadStarted);
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
            const baseControl = new BaseControl(baseControlOptions);
            await baseControl._beforeMount(baseControlOptions);
            baseControl.saveOptions(baseControlOptions);

            loadStarted = false;
            baseControlOptions = {...baseControlOptions};
            baseControl._beforeUpdate(baseControlOptions);
            assert.isTrue(loadStarted);
        });
    });

    describe('_beforeMount', () => {
        it('_beforeMount with prefetchProxy', async () => {
            const baseControlOptions = getBaseControlOptionsWithEmptyItems();
            baseControlOptions.source = new PrefetchProxy({
                target: new Memory(),
                data: {
                    query: new DataSet()
                }
            });
            const baseControl = new BaseControl(baseControlOptions);
            const mountResult = await baseControl._beforeMount(baseControlOptions);
            assert.isTrue(!mountResult);
        })
    });

    describe('Edit in place', () => {
        type TEditingConfig = IEditableListOption['editingConfig'];

        const baseControlCfg = {
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: ListViewModel,
            items: new RecordSet({
                keyProperty: 'id',
                rawData: []
            })
        };
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
                updateOptions() {}
            };

            return baseControl._beforeUpdate({...baseControlCfg, filter: {field: 'ASC'}, useNewModel: true}).then(() => {
                assert.isTrue(isEditingCancelled);
            });
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
                const options: IEditableListOption = {
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
                stubReload = sinon.stub(BaseControl._private, 'reload').callsFake(() => Promise.resolve());
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
});
