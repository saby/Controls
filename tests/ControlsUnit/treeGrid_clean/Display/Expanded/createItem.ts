import { assert } from 'chai';

import {RecordSet} from 'Types/collection';
import {Tree} from 'Controls/display';
import { IData } from 'Types/source';
import {Model} from 'Types/entity';

function getData(): IData[] {
    /*
        0 - root
            1
                10
                11
                12
                    121
                    122
                    123
            2
                20
                    200
                        2000
            3
            4
    */

    return [{
        id: 10,
        pid: 1,
        node: true,
        title: 'AA'
    }, {
        id: 11,
        pid: 1,
        node: true,
        title: 'AB'
    }, {
        id: 12,
        pid: 1,
        node: true,
        title: 'AC'
    }, {
        id: 121,
        pid: 12,
        node: true,
        title: 'ACA'
    }, {
        id: 122,
        pid: 12,
        node: false,
        title: 'ACB'
    }, {
        id: 123,
        pid: 12,
        node: false,
        title: 'ACC'
    }, {
        id: 1,
        pid: 0,
        node: true,
        title: 'A'
    }, {
        id: 2,
        pid: 0,
        node: true,
        title: 'B'
    }, {
        id: 20,
        pid: 2,
        node: true,
        title: 'BA'
    }, {
        id: 200,
        pid: 20,
        node: true,
        title: 'BAA'
    }, {
        id: 2000,
        pid: 200,
        title: 'BAAA'
    }, {
        id: 3,
        pid: 0,
        node: false,
        title: 'C'
    }, {
        id: 4,
        pid: 0,
        title: 'D'
    }];
}

function getTree(): Tree<Model> {
    const rs = new RecordSet({
        rawData: getData(),
        keyProperty: 'id'
    });
    return new Tree({
        collection: rs,
        root: {
            id: 0,
            title: 'Root'
        },
        keyProperty: 'id',
        parentProperty: 'pid',
        nodeProperty: 'node'
    });
}

describe('Controls/tree/expanded', () => {
    it('create item with init expanded', () => {
        const tree = getTree();
        tree.setExpandedItems([12345]);
        const item = tree.createItem({
            contents: new Model({
                rawData: {id: 12345},
                keyProperty: 'id'
            })
        });

        assert.isTrue(item.isExpanded());
    });
});
