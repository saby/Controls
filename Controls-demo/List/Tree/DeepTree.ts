import Control = require('Core/Control')
import template = require('wml!Controls-demo/List/Tree/DeepTree')
import { Memory } from 'Types/source'

function getItem(id, cfg) {
    cfg = cfg || {};
    let item = {
        'id': `${id}`,
        'idInfo': `Row title with id ${id}`,
        'title': 'title' in cfg ? `${cfg.title}` : `Row title with id ${id}`
    };
    item['parent'] = 'parent' in cfg ? cfg.parent : null;
    item['nodeType'] = 'nodeType' in cfg ? cfg.nodeType : null;
    if ('group' in cfg) {
        item['group'] = cfg.group;
    }
    return item;
}


class DeepTree extends Control {

    protected _template: Function = template;

    protected _viewSource = new Memory({
        keyProperty: 'id',
        data: [
            getItem('1', { nodeType: true, parent: null, group: 'group_1'}),
            getItem('1_1', { nodeType: true, parent: '1', group: 'group_1'}),
            getItem('1_1_1', { nodeType: null, parent: '1_1', group: 'group_1'}),
            getItem('1_1_2', { nodeType: null, parent: '1_1', group: 'group_1'}),
            getItem('1_2', { nodeType: null, parent: '1', group: 'group_1'}),
            getItem('2', { nodeType: false, parent: null, group: 'group_1'}),
            getItem('2_1', { nodeType: null, parent: '2', group: 'group_1'}),
            getItem('3', { nodeType: false, parent: null, group: 'group_2'}),
            getItem('3_1', { nodeType: null, parent: '3', group: 'group_2'}),
            getItem('4', { nodeType: null, parent: null, group: 'group_2'})
        ]
    });


    protected _columns = [{displayProperty: 'title'}];

    protected _header = [{title: 'Название'}];

    protected _groupingKeyCallback(item) {
        return item.get('group');
    }

}

export = DeepTree;

