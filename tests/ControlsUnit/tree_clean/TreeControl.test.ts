import {assert} from 'chai';

import {TreeControl} from 'Controls/tree';
import {NewSourceController} from 'Controls/dataSource';
import { RecordSet } from 'Types/collection';
import {Memory} from 'Types/source';
import { ITreeControlOptions } from 'Controls/_tree/TreeControl';

/*
* 1
*    2
*       3
*       4
*    5
* 6
* 7
*/
const DEFAULT_DATA = [{
    id: 1,
    parent: null,
    node: true,
    hasChildren: true
}, {
    id: 2,
    parent: 1,
    node: false,
    hasChildren: false
}, {
    id: 3,
    parent: 2,
    node: false,
    hasChildren: false
}, {
    id: 4,
    parent: 2,
    node: null,
    hasChildren: false
}, {
    id: 5,
    parent: 1,
    node: null,
    hasChildren: false
}, {
    id: 6,
    parent: null,
    node: true,
    hasChildren: false
}, {
    id: 7,
    parent: null,
    node: null,
    hasChildren: false
}];

function createTreeControl(
    data: object[] = DEFAULT_DATA, cfg: ITreeControlOptions = {} as ITreeControlOptions
): TreeControl {
    let treeControl;
    const cfgTreeControl: ITreeControlOptions = {
        ...TreeControl.getDefaultOptions(),
        keyProperty: 'id',
        parentProperty: 'parent',
        nodeProperty: 'node',
        hasChildrenProperty: 'hasChildren',
        viewModelConstructor: 'Controls/treeGrid:TreeGridCollection',
        columns: [],
        ...cfg
    };

    if (!cfgTreeControl.sourceController) {
        const sourceController = new NewSourceController({
            source: new Memory({
                data,
                keyProperty: cfgTreeControl.keyProperty
            }),
            navigation: cfgTreeControl.navigation,
            expandedItems: cfgTreeControl.expandedItems,
            root: cfgTreeControl.root,
            keyProperty: cfgTreeControl.keyProperty
        });

        sourceController.setItems(new RecordSet({
            keyProperty: cfgTreeControl.keyProperty,
            rawData: data
        }));

        cfgTreeControl.sourceController = sourceController;
    }
    treeControl = new TreeControl(cfgTreeControl);
    treeControl._children = {};
    treeControl.saveOptions(cfgTreeControl);
    treeControl._beforeMount(cfgTreeControl);

    return treeControl;
}

describe('Controls/tree/TreeControl', () => {
    describe('drag', () => {
        describe('_mouseLeave', () => {
            it('should clear timeout for expand node', () => {
                const treeControl = createTreeControl();
                // @ts-ignore
                treeControl._timeoutForExpandOnDrag = 123;
                // @ts-ignore
                treeControl._mouseLeave();
                // @ts-ignore
                assert.isNotOk(treeControl._timeoutForExpandOnDrag);
            });
        });
    });

    it('toggleExpanded should be aborted if tree was destroyed', async () => {
        const treeControl = createTreeControl();

        treeControl._notify = (eName) => eName === 'beforeItemExpand' ? new Promise((resolve) => {
            setTimeout(resolve, 10);
        }) : undefined;

        // Разворот узла
        const togglePromise = treeControl.toggleExpanded(1) as Promise<void>;

        // Разрушение контрола
        treeControl._beforeUnmount();

        await new Promise((resolve) => {
            togglePromise.then(() => resolve(true)).catch(() => resolve(false));
        }).then(isToggledSuccess => {
            assert.isFalse(isToggledSuccess);
        })
    });
});
