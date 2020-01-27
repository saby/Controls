/**
 * Библиотека контролов, которые реализуют иерархический список, отображающийся в виде плитки.
 * @library Controls/tile
 * @includes View Controls/_tile/View
 * @includes ItemTemplate Controls/tile:ItemTemplate
 * @includes ITile Controls/_tile/interface/ITile
 * @includes IDraggable Controls/interface/IDraggable
 * @public
 * @author Крайнов Д.О.
 */

/*
 * tile library
 * @library Controls/tile
 * @includes View Controls/_tile/View
 * @includes ItemTemplate Controls/tile:ItemTemplate
 * @includes ITile Controls/_tile/interface/ITile
 * @includes IDraggable Controls/interface/IDraggable
 * @public
 * @author Крайнов Д.О.
 */

import View = require('Controls/_tile/View');
import ItemTemplate = require('wml!Controls/_tile/ItemTemplateChooser');
import FolderItemTemplate = require("wml!Controls/_tile/TreeTileView/FolderTpl");
import TileItemTemplate = require("wml!Controls/_tile/TileView/TileTpl");

import TreeViewModel = require('Controls/_tile/TreeTileView/TreeTileViewModel');
import TreeView = require('Controls/_tile/TreeTileView/TreeTileView');

export {
   View,
   ItemTemplate,
   FolderItemTemplate,
   TileItemTemplate,

   TreeViewModel,
   TreeView
};
