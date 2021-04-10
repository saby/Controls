/**
 * Библиотека контролов, которые реализуют иерархический список, отображающийся в виде дерева.
 * @library Controls/treeGrid
 * @includes ItemTemplate Controls/_treeGridOld/interface/ItemTemplate
 * @includes RowEditor Controls/_treeGridOld/interface/RowEditor
 * @public
 * @author Крайнов Д.О.
 */

import {default as View} from 'Controls/_treeGridOld/View';

import { GridLayoutUtil } from 'Controls/gridOld';
import GridLayoutItemTemplate = require('wml!Controls/_treeGridOld/TreeGridView/layout/grid/Item');
import TableLayoutItemTemplate = require('wml!Controls/_treeGridOld/TreeGridView/layout/table/Item');
import NodeFooterTemplate = require('wml!Controls/_treeGridOld/TreeGridView/NodeFooterTemplate');
import ViewModel = require('Controls/_treeGridOld/TreeGridView/TreeGridViewModel');

import SearchGridViewModel = require('Controls/_treeGridOld/SearchView/SearchGridViewModel');
import {SearchView, SearchItemTpl} from 'Controls/_treeGridOld/SearchView';
import * as SearchBreadCrumbsItemTemplate from 'wml!Controls/_treeGridOld/SearchView/SearchBreadCrumbsItemTemplate';
import TreeGridView = require('Controls/_treeGridOld/TreeGridView/TreeGridView');
import 'wml!Controls/_treeGridOld/TreeGridView/layout/common/NodeFooterChooser';
import RowEditor = require('wml!Controls/_treeGridOld/TreeGrid/RowEditor');

// FIXME: при обычном условном присвоении шаблона tmpl = isAny ? tmpl1 : tmpl2, переменной один раз присвоится значение и не будет меняться.
//  В таком случае возникает ошибка при открытии одной страницы из разных браузеров (Chrome и IE), с сервера всегда будет возвращаться один и тот же шаблон,
//  для того браузера, который первый открыл страницу.
//  Данным хахом мы подменяем шаблонную функцию и возвращаем правильную. Тоже самое, что вынести в отдельный шаблон и там условно вызвать паршл,
//  но быстрее по времени.
//  По словам Макса Крылова это ничего не сломает, если на функцию навесить флаги ядра.
//  Найти нормальное решение по https://online.sbis.ru/opendoc.html?guid=41a8dbab-93bb-4bc0-8533-6b12c0ec6d8d
const ItemTemplate = function() {
    return GridLayoutUtil.isFullGridSupport() ? GridLayoutItemTemplate.apply(this, arguments) : TableLayoutItemTemplate.apply(this, arguments);
};
ItemTemplate.stable = true;
ItemTemplate.isWasabyTemplate = true;


export {
    View,
    ItemTemplate,
    NodeFooterTemplate,

    ViewModel,
    SearchGridViewModel,
    SearchView,
    SearchItemTpl,
    SearchBreadCrumbsItemTemplate,
    TreeGridView,
    RowEditor
};
export {IReloadableTreeGrid} from 'Controls/_treeGridOld/interface/IReloadableTreeGrid';
