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
*          4
*       5
*    6
* 7
* 8
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
    parent: 3,
    node: null,
    hasChildren: false
}, {
    id: 5,
    parent: 2,
    node: null,
    hasChildren: false
}, {
    id: 6,
    parent: 1,
    node: null,
    hasChildren: false
}, {
    id: 7,
    parent: null,
    node: true,
    hasChildren: false
}, {
    id: 8,
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

    describe('.getDefaultAddParentKey()', () => {
        describe('marker missing', () => {
            it('marker not setted, root=null => default add position = current root(null)', () => {
                const treeControl = createTreeControl();
                assert.equal(treeControl.getDefaultAddParentKey(), null);
            });

            it('marker not setted, root=1 => default add position = current root(1)', () => {
                const treeControl = createTreeControl(DEFAULT_DATA, { root: 1 });
                assert.equal(treeControl.getDefaultAddParentKey(), 1);
            });
        });

        describe('root = null', () => {
            it('marker setted to collapsed root folder(1), root=null => default add position = current root(null)', () => {
                const treeControl = createTreeControl();
                treeControl.setMarkedKey(1);
                assert.equal(treeControl.getDefaultAddParentKey(), null);
            });

            it('marker setted to expanded root folder(1), root=null => default add position = expanded folder(1)', () => {
                const treeControl = createTreeControl(DEFAULT_DATA, { expandedItems: [1] });
                treeControl.setMarkedKey(1);
                assert.equal(treeControl.getDefaultAddParentKey(), 1);
            });

            it('marker setted to expanded root folder(2), root=null => default add position = expanded folder(2)', () => {
                const treeControl = createTreeControl(DEFAULT_DATA, { expandedItems: [1, 2] });
                treeControl.setMarkedKey(2);
                assert.equal(treeControl.getDefaultAddParentKey(), 2);
            });
        });

        describe('root = folder', () => {
            it('marker setted to collapsed root folder(2), root=1 => default add position = current root(1)', () => {
                const treeControl = createTreeControl(DEFAULT_DATA, { root: 1 });
                treeControl.setMarkedKey(2);
                assert.equal(treeControl.getDefaultAddParentKey(), 1);
            });

            it('marker setted to expanded root folder(2), root=1 => default add position = expanded folder(2)', () => {
                const treeControl = createTreeControl(DEFAULT_DATA, { root: 1, expandedItems: [2] });
                treeControl.setMarkedKey(2);
                assert.equal(treeControl.getDefaultAddParentKey(), 2);
            });

            it('marker setted to expanded root folder(2), root=1 => default add position = expanded folder(3)', () => {
                const treeControl = createTreeControl(DEFAULT_DATA, { expandedItems: [1, 2, 3] });
                treeControl.setMarkedKey(3);
                assert.equal(treeControl.getDefaultAddParentKey(), 3);
            });
        });
    });
});
