import {TemplateFunction} from 'UI/Base';
import {GridView, GridLayoutUtil} from 'Controls/grid';

import * as GridItemTemplate from 'wml!Controls/_treeGrid/TreeGridView/layout/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_treeGrid/TreeGridView/layout/table/Item';

import 'wml!Controls/_treeGrid/TreeGridView/layout/common/NodeFooterChooser';

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
        _onExpanderClick(e, dispItem): void {
            this._notify('expanderClick', [dispItem], {bubbling: true});
            e.stopImmediatePropagation();
        },
        _onLoadMoreClick(e, dispItem): void {
            this._notify('loadMoreClick', [dispItem]);
        },
        _prepareFooterTemplateColumns(colspanColumns?, backgroundStyle: string = 'default') {
            const prepared = TreeGridView.superclass._prepareFooterTemplateColumns.apply(this, arguments);

            if (this._options.expanderIcon !== 'none' && this._options.expanderSize) {
                prepared[0].classes += ` controls-TreeGridView__footer__expanderPadding-${this._options.expanderSize.toLowerCase()}_theme-${this._options.theme}`;
            }

            return prepared;
        }
    });

TreeGridView._theme = ['Controls/grid', 'Controls/treeGrid'];
export = TreeGridView;
