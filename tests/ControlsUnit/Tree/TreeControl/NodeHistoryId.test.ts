import {createSandbox, spy, assert as sinonAssert} from 'sinon';
import {HierarchicalMemory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {register} from 'Types/di';
import {TreeGridCollection} from 'Controls/treeGrid';
import {nodeHistoryUtil} from '../../../Controls/_dataSource/nodeHistoryUtil';
import {TreeControl} from 'Controls/tree';
import {ITreeControlOptions} from 'Controls/_tree/TreeControl';

register('Controls/treeGrid:TreeGridCollection', TreeGridCollection, {instantiate: false});

describe('Controls/Tree/TreeControl/NodeHistoryId', () => {
    let source: HierarchicalMemory;
    let data: object[] = [];
    let config: Partial<ITreeControlOptions>;
    let recordSet: RecordSet;

    const fakeSourceController = {
        hasMoreData: (direction: string, root: string) => root !== null && root !== '3',
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
        },
        setExpandedItems: () => {},
        getExpandedItems: () => ([]),
        getKeyProperty: () => 'id'
    };

    function initTreeControl(cfg: Partial<ITreeControlOptions> = {}): TreeControl {
        config = {
            viewName: 'Controls/List/TreeGridView',
            root: null,
            useNewModel: true,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeHistoryId: 'NODE_HISTORY_ID',
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
        config = undefined;
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
                id: '11',
                parent: '1',
                type: null
            },
            {
                id: '21',
                parent: '2',
                type: null
            }
        ];
        recordSet = new RecordSet({
            keyProperty: 'id',
            rawData: data
        });
    });
});
