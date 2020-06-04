import {TemplateFunction} from 'UI/Base';
import {GridView} from 'Controls/grid';

import * as ItemOutputWrapper from 'wml!Controls/_treeGrid/TreeGridView/ItemOutputWrapper';
import * as GridItemTemplate from 'wml!Controls/_treeGrid/TreeGridView/layout/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_treeGrid/TreeGridView/layout/table/Item';

import 'wml!Controls/_treeGrid/TreeGridView/layout/common/NodeFooterChooser';
import {isFullGridSupport} from '../../_grid/utils/GridLayoutUtil';

var
    TreeGridView = GridView.extend({
        _itemOutputWrapper: ItemOutputWrapper,
        _defaultItemTemplate: GridItemTemplate,
        _beforeUpdate(newCfg) {
            TreeGridView.superclass._beforeUpdate.apply(this, arguments);
            if (this._options.expanderSize !== newCfg.expanderSize) {
                this._listModel.setExpanderSize(newCfg.expanderSize);
            }
        },
        _resolveBaseItemTemplate(): TemplateFunction {
            return isFullGridSupport() ? GridItemTemplate : TableItemTemplate;
        },
        _onExpanderClick(e, dispItem): void {
            this._notify('expanderClick', [dispItem], {bubbling: true});
            e.stopImmediatePropagation();
        },
        _onLoadMoreClick(e, dispItem): void {
            this._notify('loadMoreClick', [dispItem]);
        },
        _onNodeFooterClick(e, dispItem) {
            if (e.target.closest('.js-controls-TreeGrid__nodeFooter__LoadMoreButton')) {
                e.stopPropagation();
                this._notify('loadMoreClick', [dispItem]);
            }
        },
        // protected
        _getFooterClasses(): string {
            let classes = ' controls-TreeGridView__footer';

            // До решения задачи https://online.sbis.ru/opendoc.html?guid=19dddced-0bd1-45bb-9c8e-cfeb1b9d1c75
            // отключаем у подвала отступ под иконку узла. На шаблоне записи есть опция expanderIcon, отвечает стиль
            // иконки expander'а. Если она задана как none, экспандера не должно быть. Так может быть задано у всех записей.
            // Тогда у подвала нарисуется ненужный отступ, т.к. подвал ничего не знает про записи и их опции
            if (this._options.expanderSize) {
                classes += ` controls-TreeGridView__footer__expanderPadding-${this._options.expanderSize.toLowerCase()}_theme-${this._options.theme}`;
            }
            return TreeGridView.superclass._getFooterClasses.apply(this, arguments) + classes;
        }
    });

TreeGridView._theme = ['Controls/grid', 'Controls/treeGrid'];
export = TreeGridView;
