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
            let cfgClone = {...baseControlCfg};
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
});
