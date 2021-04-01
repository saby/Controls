import {HierarchicalMemory, Query} from 'Types/source';
import {ITreeControlOptions, TreeControl} from 'Controls/tree';
import { RecordSet } from 'Types/collection';
import { TreeGridCollection } from 'Controls/treeGridNew';
import { register } from 'Types/di';
import { assert } from 'chai';
import { stub, spy, assert as sinonAssert } from 'sinon';

register('Controls/treeGrid:TreeGridCollection', TreeGridCollection, {instantiate: false});

describe('Controls/Tree/TreeControl/LastExpandedNode', () => {
    let source: HierarchicalMemory;
    let data = [];

    const fakeSourceController = {
        hasMoreData: (direction: string, root: string) => root !== null,
        setDataLoadCallback: () => {},
        getState: () => ({}),
        getItems: () => new RecordSet({
            keyProperty: 'id',
            rawData: data
        }),
        getCollapsedGroups: () => {},
        getLoadError: () => false,
        updateOptions: () => {},
        hasLoaded: (key: string) => true,
        load: (direction: string, root: string) => {
            const query = new Query().where({root});
            return source.query(query);
        }
    };

    function initTreeControl(cfg: Partial<ITreeControlOptions> = {}): TreeControl {
        const config: ITreeControlOptions = {
            viewName: 'Controls/List/TreeGridView',
            useNewModel: true,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'type',
            source,
            viewModelConstructor: 'Controls/treeGrid:TreeGridCollection',
            sourceController: fakeSourceController,
            virtualScrollConfig: {
                pageSize: 1
            },
            ...cfg
        };
        const treeControl = new TreeControl(config);
        treeControl.saveOptions(config);
        treeControl._beforeMount(config);
        return treeControl;
    }

    beforeEach(() => {
        data = [
            {
                id: '1',
                parent: null,
                type: true
            },
            {
                id: '2',
                parent: null,
                type: true
            },
            {
                id: '21',
                parent: '2',
                type: null
            },
            {
                id: '22',
                parent: '2',
                type: null
            }
        ];
    })

    it ('should load from root when items are collapsed', async () => {
        source = new HierarchicalMemory({
            keyProperty: 'id',
            data
        });
        const spyQuery = spy(source, 'query');
        const treeControl = initTreeControl();
        await treeControl.handleTriggerVisible('down');
        sinonAssert.notCalled(spyQuery);
        spyQuery.restore();
    });

    it ('should load from root when expanded item is not last', async () => {
        data = [
            ...data,
            {
                id: '3',
                parent: null,
                type: true
            }
        ];
        source = new HierarchicalMemory({
            keyProperty: 'id',
            data
        });

        const spyQuery = spy(source, 'query');
        const treeControl = initTreeControl();
        treeControl.toggleExpanded('2');

        await treeControl.handleTriggerVisible('down');
        sinonAssert.notCalled(spyQuery);
        spyQuery.restore();
    });

    it ('should load from last expanded node', async () => {
        source = new HierarchicalMemory({
            keyProperty: 'id',
            data
        });

        const stubQuery = stub(source, 'query').callsFake((query: Query) => {
            assert.equal(query.getWhere().root, 2);
            return Promise.resolve();
        });
        const treeControl = initTreeControl();
        treeControl.toggleExpanded('2');

        await treeControl.handleTriggerVisible('down');

        sinonAssert.called(stubQuery);
        stubQuery.restore();
    });

    it ('should not load from last expanded node when nodeFooterTemplate is set', async () => {
        source = new HierarchicalMemory({
            keyProperty: 'id',
            data
        });

        const spyQuery = spy(source, 'query');
        const treeControl = initTreeControl({
            nodeFooterTemplate: () => {}
        });
        treeControl.toggleExpanded('2');

        await treeControl.handleTriggerVisible('down');
        sinonAssert.notCalled(spyQuery);
        spyQuery.restore();
    });
});
