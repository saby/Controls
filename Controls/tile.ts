/**
 * Библиотека контролов, которые реализуют иерархический список, отображающийся в виде плитки.
 * @library Controls/tile
 * @includes View Controls/_tile/View
 * @includes ItemTemplate Controls/tile:ItemTemplate
 * @includes ITile Controls/_tile/interface/ITile
 * @includes SmallItemTemplate Controls/tile:SmallTemplate
 * @includes MediumTemplate Controls/tile:MediumTemplate
 * @includes PreviewTemplate Controls/tile:PreviewTemplate
 * @includes RichTemplate Controls/tile:RichTemplate
 * @public
 * @author Крайнов Д.О.
 */

/*
 * tile library
 * @library Controls/tile
 * @includes View Controls/_tile/View
 * @includes ItemTemplate Controls/tile:ItemTemplate
 * @includes ITile Controls/_tile/interface/ITile
 * @includes IDraggable Controls/_interface/IDraggable
 * @includes SmallItemTemplate Controls/tile:SmallTemplate
 * @includes MediumTemplate Controls/tile:MediumTemplate
 * @includes PreviewTemplate Controls/tile:PreviewTemplate
 * @includes RichTemplate Controls/tile:RichTemplate
 * @public
 * @author Крайнов Д.О.
 */

import {default as View} from 'Controls/_tile/View';
import ItemTemplate = require('wml!Controls/_tile/ItemTemplateChooser');
import FolderItemTemplate = require("wml!Controls/_tile/TreeTileView/FolderTpl");
import TileItemTemplate = require("wml!Controls/_tile/TileView/TileTpl");
import * as SmallItemTemplate from 'wml!Controls/_tile/TileView/resources/SmallTemplate';
import * as MediumTemplate from 'wml!Controls/_tile/TileView/resources/MediumTemplate';
import * as PreviewTemplate from 'wml!Controls/_tile/TileView/resources/PreviewTemplate';
import * as RichTemplate from 'wml!Controls/_tile/TileView/resources/RichTemplate';
import {default as ActionsMenu} from 'Controls/_tile/ItemActions/Menu';

import TreeViewModel = require('Controls/_tile/TreeTileView/TreeTileViewModel');
import TreeView = require('Controls/_tile/TreeTileView/TreeTileView');

export {
   View,
   ItemTemplate,
   FolderItemTemplate,
   TileItemTemplate,
   SmallItemTemplate,
   MediumTemplate,
   PreviewTemplate,
   RichTemplate,
   ActionsMenu,
   TreeViewModel,
   TreeView
};
