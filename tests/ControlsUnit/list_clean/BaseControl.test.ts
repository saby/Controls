import {assert} from 'chai';
import {BaseControl, ListViewModel} from 'Controls/list';
import {RecordSet} from 'Types/collection';
import {Memory} from 'Types/source';
import * as Env from 'Env/Env';

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
            baseControl._container = {
                getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}]),
                clientHeight: 1000
            };
            baseControl._itemsContainerReadyHandler(null, () => {
                return {children: []};
            });
            assert.isFalse(baseControl._pagingVisible);
            await baseControl.canScrollHandler({
                scrollHeight: 1000,
                clientHeight: 400,
                scrollTop: 0
            });
            baseControl._observeScrollHandler(null, 'viewportResize', {clientHeight: 400});
            baseControl._mouseEnter(null);
            assert.isTrue(baseControl._pagingVisible);

            await baseControl.cantScrollHandler(null);
            assert.isFalse(baseControl._pagingVisible, 'Wrong state _pagingVisible after scrollHide');
            //BaseControl._private.handleListScrollSync(baseControl, 200);
            baseControl.scrollMoveSyncHandler({scrollTop: 200});
            assert.isFalse(baseControl._pagingVisible);
            Env.detection.isMobilePlatform = true;
            baseControl.scrollMoveSyncHandler({scrollTop: 200});
            assert.isTrue(baseControl._pagingVisible);
            Env.detection.isMobilePlatform = undefined;
        });
        it('is viewport = 0', async () => {
            baseControl.saveOptions(baseControlCfg);
            await baseControl._beforeMount(baseControlCfg);
            baseControl._beforeUpdate(baseControlCfg);
            baseControl._afterUpdate(baseControlCfg);
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
                data: getData(100)
            });

            await baseControl._beforeMount(cfgClone);
            baseControl.saveOptions(cfgClone);

            baseControl._container = {
                clientHeight: 1000
            };
            baseControl._sourceController = {
                getAllDataCount: () => 100,
                hasMoreData: () => false
            };
            baseControl._listViewModel._startIndex = 0;
            baseControl._listViewModel._stopIndex = 100;
            baseControl._viewportSize = 400;
            baseControl._getItemsContainer = () => {
                return {children: []};
            };
            baseControl._mouseEnter(null);
            baseControl._notify = (event, args) => {
                assert.equal(event, 'doScroll');
                assert.equal(args[0], 400);
            };

            // эмулируем появление скролла
            await BaseControl._private.onScrollShow(baseControl, heightParams);
            baseControl._updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isTrue(!!baseControl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');

            assert.equal(baseControl._pagingCfg.pagesCount, 3);

            BaseControl._private.handleListScrollSync(baseControl, 100);
            assert.deepEqual({
                begin: 'visible',
                end: 'visible',
                next: 'hidden',
                prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);
            assert.isTrue(baseControl._pagingCfg.showEndButton);

            assert.equal(baseControl._currentPage, 1);

            await baseControl.__selectedPageChanged(null, 2);
            assert.equal(baseControl._currentPage, 2);
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
                scrollTop: 0,
                scrollHeight: 1000,
                clientHeight: 400
            };
            assert.deepEqual(baseControl._getScrollParams(baseControl), scrollParams);
            scrollParams.scrollTop = 400;
            baseControl.scrollMoveSyncHandler({scrollTop: scrollParams.scrollTop});
            assert.deepEqual(baseControl._getScrollParams(baseControl), scrollParams);

            baseControl.scrollMoveSyncHandler({scrollTop: 0});
            scrollParams.scrollTop = 100;
            scrollParams.scrollHeight = 1200;
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
});
