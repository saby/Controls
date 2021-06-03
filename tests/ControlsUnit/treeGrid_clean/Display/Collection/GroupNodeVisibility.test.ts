import * as sinon from 'sinon';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {TreeGridCollection, TGroupNodeVisibility} from 'Controls/treeGrid';

describe('Controls/treeGrid_clean/Display/Collection/GroupNodeVisibility', () => {

    // _updateGroupNodeVisibility всегда пытается дёрнуть первую запись в коллекции через at,
    // поэтому тут я проверяю, что at в коллекции был или не был вызван
    describe('_updateGroupNodeVisibility', () => {
        let recordSet: RecordSet;
        let groupNodeVisibility: string;
        let sandbox: any;

        function getCollection(options?: {
            collection?: RecordSet,
            groupNodeVisibility?: TGroupNodeVisibility
        }): TreeGridCollection<any> {
            return new TreeGridCollection({
                collection: options?.collection || recordSet,
                groupNodeVisibility: options?.groupNodeVisibility || groupNodeVisibility,
                keyProperty: 'key',
                parentProperty: 'parent',
                nodeProperty: 'type',
                nodeTypeProperty: 'nodeType',
                root: null,
                columns: [{}],
                expandedItems: [1]
            });
        }

        beforeEach(() => {
            groupNodeVisibility = 'hasdata';
            recordSet = new RecordSet({
                rawData: [
                    {
                        key: 1,
                        parent: null,
                        type: true,
                        nodeType: 'group'
                    },
                    {
                        key: 2,
                        parent: 1,
                        type: null,
                        nodeType: null
                    }
                ],
                keyProperty: 'key'
            });
            recordSet.setMetaData({
                singleGroupNode: true
            });
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('add to RecordSet, groupNodeVisibility !== \'hasdata\', should not be called', () => {
            const collection = getCollection({
                groupNodeVisibility: 'visible'
            });
            const item = new Model({
                keyProperty: 'key',
                rawData: {
                    key: 3,
                    parent: null,
                    type: true,
                    nodeType: 'group'
                }
            });

            const spyAt = sandbox.spy(collection, 'at');

            recordSet.setMetaData({
                singleGroupNode: false
            });
            recordSet.add(item, 2);

            sandbox.assert.notCalled(spyAt);
        });

        it('remove from RecordSet, no data, should not be called', () => {
            const collection = getCollection();
            recordSet.setMetaData({
                singleGroupNode: false
            });

            recordSet.removeAt(1);

            const spyAt = sandbox.spy(collection, 'at');

            recordSet.removeAt(0);

            sandbox.assert.notCalled(spyAt);
        });

        it('reset in RecordSet, no data, should not search first item', () => {
            const collection = getCollection();
            const emptyRecordSet = new RecordSet({
                keyProperty: 'key',
                rawData: []
            });
            const spyAt = sandbox.spy(collection, 'at');
            emptyRecordSet.setMetaData({
                singleGroupNode: false
            });
            recordSet.assign(emptyRecordSet);

            sandbox.assert.notCalled(spyAt);
        });

        it('reset in RecordSet, should be called', () => {
            const collection = getCollection();
            const cloneRecordSet = recordSet.clone();

            const spyAt = sandbox.spy(collection, 'at');

            recordSet.assign(cloneRecordSet);
            recordSet.setMetaData({
                singleGroupNode: true
            });
            sandbox.assert.called(spyAt);
        });

        it('add to RecordSet, should be called', () => {
            const collection = getCollection();
            const item = new Model({
                keyProperty: 'key',
                rawData: {
                    key: 3,
                    parent: null,
                    type: true,
                    nodeType: 'group'
                }
            });

            const spyAt = sandbox.spy(collection, 'at');

            recordSet.setMetaData({
                singleGroupNode: false
            });
            recordSet.add(item, 2);

            sandbox.assert.called(spyAt);
        });

        it('remove from RecordSet, should be called', () => {
            recordSet = new RecordSet({
                rawData: [
                    {
                        key: 1,
                        parent: null,
                        type: true,
                        nodeType: 'group'
                    },
                    {
                        key: 2,
                        parent: 1,
                        type: null,
                        nodeType: null
                    },
                    {
                        key: 3,
                        parent: null,
                        type: true,
                        nodeType: 'group'
                    }
                ],
                keyProperty: 'key'
            });
            recordSet.setMetaData({
                singleGroupNode: false
            });
            const collection = getCollection();
            recordSet.removeAt(1);

            const spyAt = sandbox.spy(collection, 'at');
            recordSet.removeAt(0);

            sandbox.assert.called(spyAt);
        });
    });
});
