/**
 * @library Controls/treeGrid
 * @includes IGroupNodeColumn Controls/_treeGrid/interface/IGroupNodeColumn
 * @includes ItemTemplate Controls/_treeGrid/interface/ItemTemplate
 * @public
 * @author Крайнов Д.О.
 */

import { default as View } from 'Controls/_treeGrid/TreeGrid';
import { default as ItemsView } from 'Controls/_treeGrid/ItemsTreeGrid';
import TreeGridView from 'Controls/_treeGrid/TreeGridView';

import * as GroupColumnTemplate from 'wml!Controls/_treeGrid/render/GroupCellContent';
import * as GridItemTemplate from 'wml!Controls/_treeGrid/render/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_treeGrid/render/table/Item';
import * as NodeFooterTemplateGrid from 'wml!Controls/_treeGrid/render/grid/NodeFooterTemplate';
import * as NodeFooterTemplateTable from 'wml!Controls/_treeGrid/render/table/NodeFooterTemplate';

// FIXME: при обычном условном присвоении шаблона tmpl = isAny ? tmpl1 : tmpl2, переменной один раз присвоится значение и не будет меняться.
//  В таком случае возникает ошибка при открытии одной страницы из разных браузеров (Chrome и IE), с сервера всегда будет возвращаться один и тот же шаблон,
//  для того браузера, который первый открыл страницу.
//  Данным хахом мы подменяем шаблонную функцию и возвращаем правильную. Тоже самое, что вынести в отдельный шаблон и там условно вызвать паршл,
//  но быстрее по времени.
//  По словам Макса Крылова это ничего не сломает, если на функцию навесить флаги ядра.
//  Найти нормальное решение по https://online.sbis.ru/opendoc.html?guid=41a8dbab-93bb-4bc0-8533-6b12c0ec6d8d
const ItemTemplate = function() {
    return isFullGridSupport() ? GridItemTemplate.apply(this, arguments) : TableItemTemplate.apply(this, arguments);
};
ItemTemplate.stable = true;
ItemTemplate.isWasabyTemplate = true;

const NodeFooterTemplate = function() {
    return isFullGridSupport() ? NodeFooterTemplateGrid.apply(this, arguments) : NodeFooterTemplateTable.apply(this, arguments);
};
NodeFooterTemplate.stable = true;
NodeFooterTemplate.isWasabyTemplate = true;

export {
    View,
    ItemsView,
    TreeGridView,
    TreeGridViewTable,
    ItemTemplate,
    NodeFooterTemplate,
    GroupColumnTemplate,
    TableItemTemplate
};

import { register } from 'Types/di';
import TreeGridCollection from 'Controls/_treeGrid/display/TreeGridCollection';
import TreeGridDataRow from 'Controls/_treeGrid/display/TreeGridDataRow';
import TreeGridDataCell from 'Controls/_treeGrid/display/TreeGridDataCell';
import TreeGridNodeFooterRow from 'Controls/_treeGrid/display/TreeGridNodeFooterRow';
import TreeGridNodeFooterCell from 'Controls/_treeGrid/display/TreeGridNodeFooterCell';
import TreeGridFooterRow from 'Controls/_treeGrid/display/TreeGridFooterRow';
import TreeGridFooterCell from 'Controls/_treeGrid/display/TreeGridFooterCell';
import { isFullGridSupport } from 'Controls/display';
import TreeGridGroupDataRow from 'Controls/_treeGrid/display/TreeGridGroupDataRow';
import TreeGridGroupDataCell from 'Controls/_treeGrid/display/TreeGridGroupDataCell';
import TreeGridViewTable from './_treeGrid/TreeGridViewTable';
import { IGroupNodeColumn } from 'Controls/_treeGrid/interface/IGroupNodeColumn';
import { TGroupNodeVisibility } from 'Controls/_treeGrid/interface/ITreeGrid';
import TreeGridHeaderRow from "Controls/_treeGrid/display/TreeGridHeaderRow";
import TreeGridHeaderCell from "Controls/_treeGrid/display/TreeGridHeaderCell";
import TreeGridTableHeaderRow from "Controls/_treeGrid/display/TreeGridTableHeaderRow";

export {
    TreeGridFooterCell,
    TreeGridCollection,
    TreeGridDataRow,
    TreeGridDataCell,
    TreeGridNodeFooterRow,
    TreeGridNodeFooterCell,
    TreeGridGroupDataRow,
    TreeGridGroupDataCell,
    IGroupNodeColumn,
    TGroupNodeVisibility
};

register('Controls/treeGrid:TreeGridCollection', TreeGridCollection, {instantiate: false});
register('Controls/treeGrid:TreeGridDataRow', TreeGridDataRow, {instantiate: false});
register('Controls/treeGrid:TreeGridDataCell', TreeGridDataCell, {instantiate: false});
register('Controls/treeGrid:TreeGridNodeFooterRow', TreeGridNodeFooterRow, {instantiate: false});
register('Controls/treeGrid:TreeGridNodeFooterCell', TreeGridNodeFooterCell, {instantiate: false});
register('Controls/treeGrid:TreeGridFooterRow', TreeGridFooterRow, {instantiate: false});
register('Controls/treeGrid:TreeGridFooterCell', TreeGridFooterCell, {instantiate: false});
register('Controls/treeGrid:TreeGridHeaderRow', TreeGridHeaderRow, {instantiate: false});
register('Controls/treeGrid:TreeGridHeaderCell', TreeGridHeaderCell, {instantiate: false});
register('Controls/treeGrid:TreeGridTableHeaderRow', TreeGridTableHeaderRow, {instantiate: false});
register('Controls/treeGrid:TreeGridGroupDataRow', TreeGridGroupDataRow, {instantiate: false});
register('Controls/treeGrid:TreeGridGroupDataCell', TreeGridGroupDataCell, {instantiate: false});
