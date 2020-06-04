/**
 * Библиотека контролов, которые реализуют иерархический список, отображающийся в виде дерева.
 * @library Controls/treeGrid
 * @includes View Controls/_treeGrid/View
 * @includes ItemTemplate Controls/treeGrid:ItemTemplate
 * @includes ITreeControl Controls/_treeGrid/interface/ITreeControl
 * @includes RowEditor Controls/treeGrid:RowEditor
 * @public
 * @author Крайнов Д.О.
 */

import {default as View} from 'Controls/_treeGrid/View';
import ItemTemplate = require('wml!Controls/_grid/ItemTemplateResolver');
import NodeFooterTemplate = require('wml!Controls/_treeGrid/TreeGridView/NodeFooterTemplate');

import ViewModel = require('Controls/_treeGrid/TreeGridView/TreeGridViewModel');
import TreeControl = require('Controls/_treeGrid/TreeControl');
import TreeViewModel = require('Controls/_treeGrid/Tree/TreeViewModel');
import SearchGridViewModel = require('Controls/_treeGrid/SearchView/SearchGridViewModel');
import SearchView = require('Controls/_treeGrid/SearchView');
import * as SearchBreadCrumbsItemTemplate from 'wml!Controls/_treeGrid/SearchView/SearchBreadCrumbsItemTemplate';
import TreeGridView = require('Controls/_treeGrid/TreeGridView/TreeGridView');
import RowEditor = require('wml!Controls/_treeGrid/TreeGrid/RowEditor');

export {
    View,
    ItemTemplate,
    NodeFooterTemplate,

    ViewModel,
    TreeControl,
    TreeViewModel,
    SearchGridViewModel,
    SearchView,
    SearchBreadCrumbsItemTemplate,
    TreeGridView,
    RowEditor
};
