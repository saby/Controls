import * as ItemTemplate from 'wml!Controls/_tree/render/Item';

import { ListView } from 'Controls/baseList';
import { TemplateFunction } from 'UI/Base';
import { TreeItem } from 'Controls/display';
import { SyntheticEvent } from 'UI/Vdom';
import { Model } from 'Types/entity';
import 'css!Controls/treeGrid';

export default class TreeView extends ListView {
    _defaultItemTemplate: TemplateFunction = ItemTemplate;

    _beforeUpdate(newOptions: any): void {
        super._beforeUpdate(newOptions);

        if (this._options.expanderSize !== newOptions.expanderSize) {
            this._listModel.setExpanderSize(newOptions.expanderSize);
        }
    }

    protected _onItemClick(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/tree:TreeNodeFooterItem]']) {
            e.stopImmediatePropagation();
            if (e.target.closest('.js-controls-TreeGrid__nodeFooter__LoadMoreButton')) {
                this._notify('loadMore', [dispItem.getNode()]);
            }
            return;
        }

        super._onItemClick(e, dispItem);
    }

    protected _onItemMouseUp(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/tree:TreeNodeFooterItem]']) {
            e.stopImmediatePropagation();
            return;
        }

        super._onItemMouseUp(e, dispItem);
    }

    protected _onItemMouseDown(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/tree:TreeNodeFooterItem]']) {
            e.stopImmediatePropagation();
            return;
        }

        super._onItemMouseDown(e, dispItem);
    }

}
