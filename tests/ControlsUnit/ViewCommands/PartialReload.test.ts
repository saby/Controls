import PartialReload from 'Controls/_viewCommands/PartialReload';
import {RecordSet} from 'Types/collection';
import {assert} from 'chai';

describe('Controls/viewCommands:PartialReload', () => {
    let selectedItems;
    let reload;
    let items;

    const getSelectedItems = (rawData) => {
        return new RecordSet({
            rawData,
            keyProperty: 'key'
        })
    };

    beforeEach(() => {
        /*
                    1           2
                3       4           8   9   10  11
                        5                   12
                        6
                        7
        */
        items = new RecordSet({
            rawData: [
                {key: '1', parent: null, node: true, title: 'b'},
                {key: '2', parent: null, node: true, title: 'c'},
                {key: '3', parent: '1', node: null, title: 'd'},
                {key: '4', parent: '1', node: true, title: 'f'},
                {key: '5', parent: '4', node: true, title: 'g'},
                {key: '6', parent: '5', node: true, title: 'j'},
                {key: '7', parent: '6', node: null, title: 'k'},
                {key: '8', parent: '2', node: null, title: 'o'},
                {key: '9', parent: '2', node: null, title: 'p'},
                {key: '10', parent: '2', node: true, title: 'q'},
                {key: '11', parent: '2', node: null, title: 'r'},
                {key: '12', parent: '10', node: null, title: 's'}
            ],
            keyProperty: 'key'
        });
        const options = {
            keyProperty: 'key',
            parentProperty: 'parent',
            nodeProperty: 'node',
            selection: {selected: []},
            sourceController: {
                hasLoaded: () => true
            },
            items
        };
        reload = new PartialReload(options);
        reload._getSourceController = () => {
            return {
                load: () => Promise.resolve(selectedItems)
            };
        }
    });

    it('item is changed', async () => {
        const updatedItem = {
            key: '7', parent: '1', node: null, title: 'k'
        };
        selectedItems = getSelectedItems([updatedItem]);
        await reload.execute({
            selection: {selected: ['7']}
        });
        assert.deepEqual(items.getRecordById('7').getRawData(), updatedItem);
    });

    it('item is removed', async () => {
        selectedItems = getSelectedItems([]);
        await reload.execute({
            selection: {selected: ['7']}
        });
        assert.equal(items.getCount(), 11);
        assert.isNotOk(items.getRecordById('7'));
    });

    it('item is added', async () => {
        const addedItem = {
            key: '100', parent: '1', node: null
        };
        selectedItems = getSelectedItems([addedItem]);
        await reload.execute({
            selection: {selected: ['100']}
        });
        assert.equal(items.getCount(), 13);
        assert.isOk(items.getRecordById('100'));
    });

    it('item is added with sorting', async () => {
        const addedItem = {
            key: '100', parent: '1', node: null, title: 'e'
        };
        selectedItems = getSelectedItems([addedItem]);
        await reload.execute({
            selection: {selected: ['100']},
            sorting: [{
                title: 'ASC'
            }]
        });
        assert.equal(items.getCount(), 13);
        assert.equal(items.getIndexByValue('title', 'e'), 3);
    });

    it('items are added with sorting ASC', async () => {
        selectedItems = getSelectedItems([{
            key: '100', parent: '1', node: null, title: 'a'
        }, {
            key: '101', parent: '1', node: null, title: 'e'
        }, {
            key: '102', parent: '1', node: null, title: 'w'
        }]);
        await reload.execute({
            selection: {selected: ['100', '101', '102']},
            sorting: [{
                title: 'ASC'
            }]
        });
        assert.equal(items.getCount(), 15);
        assert.equal(items.getIndexByValue('title', 'a'), 0);
        assert.equal(items.getIndexByValue('title', 'e'), 4);
        assert.equal(items.getIndexByValue('title', 'w'), 14);
    });

    it('items are added with sorting DESC', async () => {
        items = new RecordSet({
            rawData: [
                {key: '1', parent: null, node: true, title: 's'},
                {key: '2', parent: null, node: true, title: 'r'},
                {key: '3', parent: '1', node: null, title: 'k'},
                {key: '7', parent: '6', node: null, title: 'd'},
                {key: '11', parent: '2', node: null, title: 'c'},
                {key: '12', parent: '10', node: null, title: 'b'}
            ],
            keyProperty: 'key'
        });
        selectedItems = getSelectedItems([{
            key: '100', parent: '1', node: null, title: 'a'
        }, {
            key: '101', parent: '1', node: null, title: 'e'
        }, {
            key: '102', parent: '1', node: null, title: 'w'
        }]);
        await reload.execute({
            selection: {selected: ['100', '101', '102']},
            sorting: [{
                title: 'DESC'
            }],
            items
        });
        assert.equal(items.getCount(), 9);
        assert.equal(items.getIndexByValue('title', 'a'), 8);
        assert.equal(items.getIndexByValue('title', 'e'), 4);
        assert.equal(items.getIndexByValue('title', 'w'), 0);
    });
});
