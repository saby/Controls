import RemoveStrategy from 'Controls/_viewCommands/Remove/HierarchyRemoveStrategy';
import {RecordSet} from 'Types/collection';
import {assert} from 'chai';

describe('Controls/viewCommands:HierarchyRemoveStrategy', () => {
    const options = {
        keyProperty: 'key',
        parentProperty: 'parent',
        nodeProperty: 'node',
        selection: {
            selected: [],
            excluded: []
        }
    };
    let items;
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
                {key: '1', parent: null, node: true},
                {key: '2', parent: null, node: true},
                {key: '3', parent: '1', node: false},
                {key: '4', parent: '1', node: true},
                {key: '5', parent: '4', node: true},
                {key: '6', parent: '5', node: true},
                {key: '7', parent: '6', node: false},
                {key: '8', parent: '2', node: false},
                {key: '9', parent: '2', node: false},
                {key: '10', parent: '2', node: true},
                {key: '11', parent: '2', node: false},
                {key: '12', parent: '10', node: false}
            ],
            keyProperty: 'key'
        });
    });

    it('remove list', () => {
        const removeStrategy = new RemoveStrategy();
        options.selection = {
            selected: ['7'],
            excluded: []
        };
        removeStrategy.remove(items, options);
        assert.equal(items.getCount(), 11);
        assert.isNotOk(items.getRecordById('7'));
    });

    it('remove folder', () => {
        const removeStrategy = new RemoveStrategy();
        options.selection = {
            selected: ['5'],
            excluded: []
        };
        removeStrategy.remove(items, options);
        assert.equal(items.getCount(), 9);
        assert.isOk(items.getRecordById('4'));
        assert.isNotOk(items.getRecordById('5'));
        assert.isNotOk(items.getRecordById('6'));
        assert.isNotOk(items.getRecordById('7'));
    });

    it('remove folder from root', () => {
        const removeStrategy = new RemoveStrategy();
        options.selection = {
            selected: ['1'],
            excluded: []
        };
        removeStrategy.remove(items, options);
        assert.equal(items.getCount(), 6);
        assert.isOk(items.getRecordById('2'));
        assert.isNotOk(items.getRecordById('1'));
        assert.isNotOk(items.getRecordById('3'));
        assert.isNotOk(items.getRecordById('5'));
    });

    it('remove item from folder', () => {
        const removeStrategy = new RemoveStrategy();
        options.selection = {
            selected: ['4'],
            excluded: ['4']
        };
        removeStrategy.remove(items, options);
        assert.equal(items.getCount(), 9);
        assert.isOk(items.getRecordById('4'));
        assert.isNotOk(items.getRecordById('5'));
        assert.isNotOk(items.getRecordById('6'));
        assert.isNotOk(items.getRecordById('7'));
    });
});
