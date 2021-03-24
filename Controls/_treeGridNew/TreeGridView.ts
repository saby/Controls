import * as Item from 'wml!Controls/_treeGridNew/render/grid/Item';

import { GridView } from 'Controls/gridNew';
import { TemplateFunction } from 'UI/Base';
import { TreeItem } from 'Controls/display';
import { SyntheticEvent } from 'UI/Vdom';
import { Model } from 'Types/entity';

export default class TreeGridView extends GridView {
    _beforeUpdate(newOptions: any): void {
        super._beforeUpdate(newOptions);
        if (this._options.expanderSize !== newOptions.expanderSize) {
            this._listModel.setExpanderSize(newOptions.expanderSize);
        }
    }

    protected _resolveBaseItemTemplate(options: any): TemplateFunction {
        return Item;
    }

    protected _onItemClick(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/treeGrid:TreeGridNodeFooterRow]']) {
            e.stopImmediatePropagation();
            if (e.target.closest('.js-controls-TreeGrid__nodeFooter__LoadMoreButton')) {
                this._notify('loadMore', [dispItem.getNode()]);
            }
            return;
        }

        super._onItemClick(e, dispItem);
    }

    protected _onItemMouseUp(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/treeGrid:TreeGridNodeFooterRow]']) {
            e.stopImmediatePropagation();
            return;
        }

        super._onItemMouseUp(e, dispItem);
    }

    protected _onItemMouseDown(e: SyntheticEvent, dispItem: TreeItem<Model>): void {
        if (dispItem['[Controls/treeGrid:TreeGridNodeFooterRow]']) {
            e.stopImmediatePropagation();
            return;
        }

        super._onItemMouseDown(e, dispItem);
    }

    static _theme: string[] =  ['Controls/grid', 'Controls/treeGrid'];
}
