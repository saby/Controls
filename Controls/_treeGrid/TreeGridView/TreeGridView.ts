import {TemplateFunction} from 'UI/Base';
import {GridView, GridLayoutUtil} from 'Controls/grid';

import * as GridItemTemplate from 'wml!Controls/_treeGrid/TreeGridView/layout/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_treeGrid/TreeGridView/layout/table/Item';

var
    TreeGridView = GridView.extend({
        _defaultItemTemplate: GridItemTemplate,
        _beforeUpdate(newCfg) {
            TreeGridView.superclass._beforeUpdate.apply(this, arguments);
            if (this._options.expanderSize !== newCfg.expanderSize) {
                this._listModel.setExpanderSize(newCfg.expanderSize);
            }
        },
        _resolveBaseItemTemplate(): TemplateFunction {
            return GridLayoutUtil.isFullGridSupport() ? GridItemTemplate : TableItemTemplate;
        },
        _onLoadMoreClick(e, dispItem): void {
            this._notify('loadMoreClick', [dispItem]);
        }
    });

TreeGridView._theme = ['Controls/grid', 'Controls/treeGrid'];
export = TreeGridView;
