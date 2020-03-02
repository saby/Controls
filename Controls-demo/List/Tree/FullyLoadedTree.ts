import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls-demo/List/Tree/FullyLoadedTree';

import { Memory } from 'Types/source';

interface IFullyLoadedTreeItem {
    id: string;
    title: string;
    parent?: string;
    nodeType?: boolean;
    hasChildren?: boolean;
}

type IFullyLoadedTreeFilter = {
    [P in keyof IFullyLoadedTreeItem]?: IFullyLoadedTreeItem[P];
};

function makeItem(item: IFullyLoadedTreeItem): IFullyLoadedTreeItem {
    return {
        parent: null,
        nodeType: null,
        hasChildren: false,
        ...item
    };
}

export default class FullyLoadedTree extends Control {
    protected _template: TemplateFunction = template;

    protected _columns = [{ displayProperty: 'title' }];

    protected _itemsSource = new Memory({
        keyProperty: 'id',
        data: [
            makeItem({ id: 'leaf_1', title: 'Simple leaf' }),
            makeItem({ id: 'node_1', title: 'Node with 1 child', nodeType: true, hasChildren: true }),
            makeItem({ id: 'leaf_2', title: 'Simple child', parent: 'node_1' }),
            makeItem({ id: 'node_2', title: 'Node with subfolder', nodeType: true, hasChildren: true }),
            makeItem({ id: 'node_3', title: 'Subfolder', parent: 'node_2', nodeType: true, hasChildren: true }),
            makeItem({ id: 'leaf_3', title: 'Child in subfolder', parent: 'node_3' }),
            makeItem({ id: 'node_4', title: 'Node with no children', nodeType: true, hasChildren: false }),
            makeItem({ id: 'leaf_4', title: 'Last item' })
        ],
        filter: (item, where: IFullyLoadedTreeFilter) => {
            // Эмулируем метод БЛ, который на запрос записей в корне также возвращает
            // их подзаписи, чтобы не происходило дополнительных запросов
            return (
                !where.parent ||
                item.get('parent') === where.parent
            );
        }
    });

    protected _loadingLog = '';

    constructor(cfg) {
        super(cfg);
        this._nodeLoaded = this._nodeLoaded.bind(this);
    }

    private _nodeLoaded(list, nodeKey) {
        this._loadingLog += `!!! Children loaded for node "${nodeKey}"\n`;
    }
}
