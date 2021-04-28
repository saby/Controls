import {TemplateFunction} from 'UI/Base';
import {GridView, GridLayoutUtil} from 'Controls/gridOld';
import SearchItemTpl = require('wml!Controls/_treeGridOld/SearchView/Item');
import 'Controls/decorator';
import 'wml!Controls/_treeGridOld/SearchView/SearchBreadCrumbsContent';
import * as GridItemTemplate from 'wml!Controls/_treeGridOld/TreeGridView/layout/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_treeGridOld/TreeGridView/layout/table/Item';
import * as NodeFooterTemplate from 'wml!Controls/_treeGridOld/TreeGridView/layout/common/NodeFooterChooser';

var
    SearchView = GridView.extend({
        _itemClickNotifiedByPathClick: false,
        constructor() {
            SearchView.superclass.constructor.apply(this, arguments);
            this._onSearchPathClick = this._onSearchPathClick.bind(this);
        },
        _beforeMount() {
            SearchView.superclass._beforeMount.apply(this, arguments);
            this._listModel.setBreadcrumbsItemClickCallback(this._onSearchPathClick);
        },
        _resolveItemTemplate() {
           return SearchItemTpl;
        },
        _resolveBaseItemTemplate(): TemplateFunction {
            return GridLayoutUtil.isFullGridSupport() ? GridItemTemplate : TableItemTemplate;
        },
        _onSearchItemClick(e, item): void {
            if (!this._itemClickNotifiedByPathClick) {
                const lastBreadCrumb = item.getContents()[item.getContents().length - 1];
                if (lastBreadCrumb) {

                    // bubbling != true, т.к. BaseControl также посылает itemClick
                    this._notify('itemClick', [lastBreadCrumb, e, this._getCellIndexByEventTarget(e)]);
                }
            }
            this._itemClickNotifiedByPathClick = false;
            e.stopPropagation();
        },
        _onSearchPathClick(e, item): void {

            // bubbling != true, т.к. BaseControl также посылает itemClick
           this._notify('itemClick', [item, e]);
           this._itemClickNotifiedByPathClick = true;
        },
        _onItemMouseUp(e, itemData) {
            const dispItem = itemData.dispItem ? itemData.dispItem : itemData;
            if (dispItem['[Controls/_display/SearchSeparator]']) {
                e.stopPropagation();
                return;
            }
            SearchView.superclass._onItemMouseUp.apply(this, arguments);
        },
        _onItemClick: function(e, itemData) {
            const dispItem = itemData.dispItem ? itemData.dispItem : itemData;
            if (dispItem['[Controls/_display/SearchSeparator]']) {
                e.stopPropagation();
                return;
            }
            SearchView.superclass._onItemClick.apply(this, arguments);
        },
        getDefaultOptions(): {} {
            return {
                itemPadding: {
                    left: 'S'
                }
            };
        }
    });

export {
    SearchView,
    SearchItemTpl
};
