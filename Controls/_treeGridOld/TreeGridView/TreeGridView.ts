import {TemplateFunction} from 'UI/Base';
import {GridView, GridLayoutUtil} from 'Controls/gridOld';

import * as GridItemTemplate from 'wml!Controls/_treeGridOld/TreeGridView/layout/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_treeGridOld/TreeGridView/layout/table/Item';
import 'css!Controls/grid';
import 'css!Controls/treeGrid';

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
        _onNodeFooterClick(e, dispItem) {
            if (e.target.closest('.js-controls-TreeGrid__nodeFooter__LoadMoreButton')) {
                this._notify('loadMore', [dispItem]);
            }
        }
    });

export = TreeGridView;