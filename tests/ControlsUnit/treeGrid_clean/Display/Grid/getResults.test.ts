import { assert } from 'chai';
import { CrudEntityKey } from 'Types/source';
import { RecordSet } from 'Types/collection';
import { TreeGridCollection } from 'Controls/treeGrid';

interface IData {
    key: CrudEntityKey;
    parent: CrudEntityKey;
    type: boolean;
    nodeType?: string;
}

describe('Controls/treeGrid_clean/Display/Grid/getResults', () => {
    let rawData: IData[];

    beforeEach(() => {
        rawData = [
            { key: 1, parent: null, type: true },
            { key: 2, parent: 1, type: true },
            { key: 3, parent: 2, type: null }
        ];
    });

    describe('_resultsIsVisible', () => {

        it('resultsVisibility=visible, should not create results when root contains no items', () => {
            rawData = [];
            const treeGridCollection = new TreeGridCollection({
                collection: new RecordSet({
                    rawData,
                    keyProperty: 'key'
                }),
                resultsPosition: 'top',
                keyProperty: 'key',
                parentProperty: 'parent',
                nodeProperty: 'type',
                resultsVisibility: 'visible',
                multiSelectVisibility: 'visible',
                task1182250038: true,
                columns: [{}],
                expandedItems: [ null ],
                root: null
            });

            assert.notExists(treeGridCollection.getResults());
        });

        it('resultsVisibility=hasdata, should create results when root contains single item', () => {
            const treeGridCollection = new TreeGridCollection({
                collection: new RecordSet({
                    rawData,
                    keyProperty: 'key'
                }),
                resultsPosition: 'top',
                keyProperty: 'key',
                parentProperty: 'parent',
                nodeProperty: 'type',
                resultsVisibility: 'hasdata',
                multiSelectVisibility: 'visible',
                task1182250038: true,
                columns: [{}],
                expandedItems: [ null ],
                root: null,
                nodeTypeProperty: 'nodeType'
            });

            assert.notExists(treeGridCollection.getResults());
        });

        it('resultsVisibility=visible, should create results when root contains single item', () => {
            const treeGridCollection = new TreeGridCollection({
                collection: new RecordSet({
                    rawData,
                    keyProperty: 'key'
                }),
                resultsPosition: 'top',
                keyProperty: 'key',
                parentProperty: 'parent',
                nodeProperty: 'type',
                resultsVisibility: 'visible',
                multiSelectVisibility: 'visible',
                task1182250038: true,
                columns: [{}],
                expandedItems: [ null ],
                root: null,
                nodeTypeProperty: 'nodeType'
            });

            assert.exists(treeGridCollection.getResults());
        });
    });
});
