/*
import {assert} from 'chai';
import {BaseControl, ListViewModel} from 'Controls/list';
import {RecordSet} from 'Types/collection';

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
    describe('BaseControl watcher selected', () => {
        const baseControlCfg = {
            viewName: 'Controls/List/ListView',
            keyProperty: 'id',
            viewModelConstructor: ListViewModel,
            items: new RecordSet({
                keyProperty: 'id',
                rawData: []
            }),
            viewModelConfig: {
                items: new RecordSet({
                    keyProperty: 'id',
                    rawData: [
                        {
                            id: 1,
                            title: 'Первый',
                            type: 1
                        },
                        {
                            id: 2,
                            title: 'Второй',
                            type: 2
                        }
                    ]
                }),
                keyProperty: 'id'
            },
            selectedKeys: [],
            excludedKeys: []
        };
        let baseControl;

        beforeEach(() => {
            baseControl = new BaseControl(baseControlCfg);
            baseControl._listViewModel = new ListViewModel(baseControlCfg.viewModelConfig);
        });

        afterEach(() => {
            baseControl.destroy();
            baseControl = undefined;
        });
        it('should create selection controller', async () => {
            const cfgClone = {...baseControlCfg};
            cfgClone.selectedKeys = [1];
            cfgClone.multiSelectVisibility = 'hidden';
            await baseControl._beforeMount(baseControlCfg);
            baseControl._container = {getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}])};
            baseControl._afterMount();
            assert.isNull(baseControl._selectionController);
            await baseControl._beforeUpdate(cfgClone);
            assert.isNull(baseControl._selectionController);
        });
        it('should create selection controller', async () => {
            const cfgClone = {...baseControlCfg};
            cfgClone.selectedKeys = [1];
            cfgClone.multiSelectVisibility = 'hidden';
            cfgClone.selectedKeysCount = null;
            baseControl.saveOptions(cfgClone);
            await baseControl._beforeMount(cfgClone);
            baseControl._container = {getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}])};
            baseControl._afterMount();
            baseControl._listViewModel = new ListViewModel(baseControlCfg.viewModelConfig);
            baseControl._createSelectionController();
            assert.isFalse(!baseControl._listViewModel || !baseControl._listViewModel.getCollection());
            assert.isNotNull(baseControl._selectionController);
        });
    });
    describe('BaseControl watcher paging', () => {
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
            baseControl._container = {getElementsByClassName: () => ([{clientHeight: 100, offsetHeight: 0}])};
            assert.isFalse(baseControl._pagingVisible);
            baseControl._viewportSize = 200;
            baseControl._viewSize = 800;
            baseControl._mouseEnter(null);
            assert.isTrue(baseControl._pagingVisible);
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
                    pagingMode: 'basic'
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
            baseControl.saveOptions(baseControlCfg);
            await baseControl._beforeMount(baseControlCfg);
            baseControl._viewSize = 1000;
            baseControl._viewportSize = 400;
            baseControl._mouseEnter(null);

            // эмулируем появление скролла
            await BaseControl._private.onScrollShow(baseControl, heightParams);
            baseControl.updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isTrue(!!baseControl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');

            BaseControl._private.handleListScrollSync(baseControl, 200);
            assert.deepEqual(
                {
                    begin: 'visible',
                    end: 'visible',
                    next: 'visible',
                    prev: 'visible'
                }, baseControl._pagingCfg.arrowState);

            BaseControl._private.handleListScrollSync(baseControl, 600);
            assert.deepEqual( {
                    begin: 'visible',
                    end: 'readonly',
                    next: 'readonly',
                    prev: 'visible'
                }, baseControl._pagingCfg.arrowState);
        });
        it('paging mode is compact', async () => {
            const cfgClone = {...baseControlCfg};
            cfgClone.navigation.viewConfig.pagingMode = 'compact';
            baseControl.saveOptions(cfgClone);
            await baseControl._beforeMount(cfgClone);
            baseControl._viewSize = 1000;
            baseControl._viewportSize = 400;
            baseControl._mouseEnter(null);

            // эмулируем появление скролла
            await BaseControl._private.onScrollShow(baseControl, heightParams);
            baseControl.updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isTrue(!!baseControl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');

            BaseControl._private.handleListScrollSync(baseControl, 200);
            assert.deepEqual({
                    begin: 'hidden',
                    end: 'visible',
                    next: 'hidden',
                    prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);

            BaseControl._private.handleListScrollSync(baseControl, 800);
            assert.deepEqual({
                    begin: 'visible',
                    end: 'hidden',
                    next: 'hidden',
                    prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);
        });
        it('paging mode is numbers', async () => {
            const cfgClone = {...baseControlCfg};
            cfgClone.navigation.viewConfig.pagingMode = 'numbers';
            baseControl.saveOptions(cfgClone);
            await baseControl._beforeMount(cfgClone);
            baseControl._viewSize = 1000;
            baseControl._viewportSize = 400;
            baseControl._mouseEnter(null);

            // эмулируем появление скролла
            await BaseControl._private.onScrollShow(baseControl, heightParams);
            baseControl.updateShadowModeHandler({}, {top: 0, bottom: 0});

            assert.isTrue(!!baseControl._scrollPagingCtr, 'ScrollPagingController wasn\'t created');

            assert.equal(baseControl._pagingCfg.pagesCount,3);

            BaseControl._private.handleListScrollSync(baseControl, 100);
            assert.deepEqual({
                    begin: 'visible',
                    end: 'hidden',
                    next: 'hidden',
                    prev: 'hidden'
            }, baseControl._pagingCfg.arrowState);

            assert.equal(baseControl._currentPage,1);

            await baseControl.__selectedPageChanged(null, 2);
            assert.equal(baseControl._currentPage,2);
            assert.equal(baseControl._scrollPagingCtr._options.scrollParams.scrollTop,400);
        });
    });
});
*/
