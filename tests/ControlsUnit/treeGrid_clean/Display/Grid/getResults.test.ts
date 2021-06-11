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

        it('Should not create results when root contains single item', () => {
            // При наличии в корне единственного узла (даже если он развернут и у него есть дочерние элементы) - не
            // должны создаваться results.
            const treeGridCollection = new TreeGridCollection({
                collection: new RecordSet({
                    rawData,
                    keyProperty: 'key'
                }),
                resultsPosition: 'top',
                keyProperty: 'key',
                parentProperty: 'parent',
                nodeProperty: 'type',
                multiSelectVisibility: 'visible',
                columns: [{}],
                expandedItems: [ null ],
                root: null
            });

            assert.notExists(treeGridCollection.getResults());
        });

        it('Should create results when root contains single groupNode item', () => {
            // При наличии в корне единственного узла (даже если он развернут и у него есть дочерние элементы) - не
            // должны создаваться results.
            rawData[0].nodeType = 'group';
            const treeGridCollection = new TreeGridCollection({
                collection: new RecordSet({
                    rawData,
                    keyProperty: 'key'
                }),
                resultsPosition: 'top',
                keyProperty: 'key',
                parentProperty: 'parent',
                nodeProperty: 'type',
                multiSelectVisibility: 'visible',
                columns: [{}],
                expandedItems: [ null ],
                root: null,
                nodeTypeProperty: 'nodeType'
            });

            assert.exists(treeGridCollection.getResults());
        });
    });
});
