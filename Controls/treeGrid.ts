/**
 * Библиотека контролов, которые реализуют иерархический список, отображающийся в виде дерева.
 * @library Controls/treeGrid
 * @includes View Controls/_treeGrid/View
 * @includes ItemTemplate Controls/treeGrid:ItemTemplate
 * @includes RowEditor Controls/treeGrid:RowEditor
 * @public
 * @author Крайнов Д.О.
 */

import {default as View} from 'Controls/_treeGrid/View';

import { GridLayoutUtil } from 'Controls/grid';
import GridLayoutItemTemplate = require('wml!Controls/_treeGrid/TreeGridView/layout/grid/Item');
import TableLayoutItemTemplate = require('wml!Controls/_treeGrid/TreeGridView/layout/table/Item');
import NodeFooterTemplate = require('wml!Controls/_treeGrid/TreeGridView/NodeFooterTemplate');
import ViewModel = require('Controls/_treeGrid/TreeGridView/TreeGridViewModel');

import SearchGridViewModel = require('Controls/_treeGrid/SearchView/SearchGridViewModel');
import SearchView = require('Controls/_treeGrid/SearchView');
import * as SearchBreadCrumbsItemTemplate from 'wml!Controls/_treeGrid/SearchView/SearchBreadCrumbsItemTemplate';
import TreeGridView = require('Controls/_treeGrid/TreeGridView/TreeGridView');
import RowEditor = require('wml!Controls/_treeGrid/TreeGrid/RowEditor');

const ItemTemplate = GridLayoutUtil.isFullGridSupport() ? GridLayoutItemTemplate : TableLayoutItemTemplate;

export {
    View,
    ItemTemplate,
    NodeFooterTemplate,

    ViewModel,
    SearchGridViewModel,
    SearchView,
    SearchBreadCrumbsItemTemplate,
    TreeGridView,
    RowEditor
};
