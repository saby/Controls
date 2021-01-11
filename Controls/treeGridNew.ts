import { default as View } from 'Controls/_treeGridNew/TreeGrid';

import * as GridItemTemplate from 'wml!Controls/_treeGridNew/render/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_treeGridNew/render/table/Item';
import * as NodeFooterTemplate from 'wml!Controls/_treeGridNew/render/NodeFooterTemplate';

// FIXME: при обычном условном присвоении шаблона tmpl = isAny ? tmpl1 : tmpl2, переменной один раз присвоится значение и не будет меняться.
//  В таком случае возникает ошибка при открытии одной страницы из разных браузеров (Chrome и IE), с сервера всегда будет возвращаться один и тот же шаблон,
//  для того браузера, который первый открыл страницу.
//  Данным хахом мы подменяем шаблонную функцию и возвращаем правильную. Тоже самое, что вынести в отдельный шаблон и там условно вызвать паршл,
//  но быстрее по времени.
//  По словам Макса Крылова это ничего не сломает, если на функцию навесить флаги ядра.
//  Найти нормальное решение по https://online.sbis.ru/opendoc.html?guid=41a8dbab-93bb-4bc0-8533-6b12c0ec6d8d
const ItemTemplate = function() {
    return GridLayoutUtil.isFullGridSupport() ? GridItemTemplate.apply(this, arguments) : TableItemTemplate.apply(this, arguments);
};
ItemTemplate.stable = true;
ItemTemplate.isWasabyTemplate = true;

export {
    View,
    ItemTemplate,
    NodeFooterTemplate
};

import { register } from 'Types/di';
import TreeGridCollection from 'Controls/_treeGridNew/display/TreeGridCollection';
import TreeGridDataRow from 'Controls/_treeGridNew/display/TreeGridDataRow';
import TreeGridDataCell from 'Controls/_treeGridNew/display/TreeGridDataCell';
import TreeGridNodeFooterRow from 'Controls/_treeGridNew/display/TreeGridNodeFooterRow';
import TreeGridNodeFooterCell from 'Controls/_treeGridNew/display/TreeGridNodeFooterCell';
import TreeGridFooterRow from 'Controls/_treeGridNew/display/TreeGridFooterRow';
import TreeGridFooterCell from 'Controls/_treeGridNew/display/TreeGridFooterCell';
import { GridLayoutUtil } from 'Controls/grid';

export {
    TreeGridCollection,
    TreeGridDataRow,
    TreeGridDataCell,
    TreeGridNodeFooterRow,
    TreeGridNodeFooterCell
};

register('Controls/treeGrid:TreeGridCollection', TreeGridCollection, {instantiate: false});
register('Controls/treeGrid:TreeGridDataRow', TreeGridDataRow, {instantiate: false});
register('Controls/treeGrid:TreeGridDataCell', TreeGridDataCell, {instantiate: false});
register('Controls/treeGrid:TreeGridNodeFooterRow', TreeGridNodeFooterRow, {instantiate: false});
register('Controls/treeGrid:TreeGridNodeFooterCell', TreeGridNodeFooterCell, {instantiate: false});
register('Controls/treeGrid:TreeGridFooterRow', TreeGridFooterRow, {instantiate: false});
register('Controls/treeGrid:TreeGridFooterCell', TreeGridFooterCell, {instantiate: false});
