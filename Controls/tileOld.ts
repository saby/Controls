import {default as View} from 'Controls/_tileOld/View';
import ItemTemplate = require('wml!Controls/_tileOld/ItemTemplateChooser');
import FolderItemTemplate = require("wml!Controls/_tileOld/TreeTileView/FolderTpl");
import TileItemTemplate = require("wml!Controls/_tileOld/TileView/TileTpl");
import * as SmallItemTemplate from 'wml!Controls/_tileOld/TileView/resources/SmallTemplate';
import * as MediumTemplate from 'wml!Controls/_tileOld/TileView/resources/MediumTemplate';
import * as PreviewTemplate from 'wml!Controls/_tileOld/TileView/resources/PreviewTemplate';
import * as RichTemplate from 'wml!Controls/_tileOld/TileView/resources/RichTemplate';
import {default as ActionsMenu} from 'Controls/_tileOld/ItemActions/Menu';

import TreeViewModel = require('Controls/_tileOld/TreeTileView/TreeTileViewModel');
import TreeView = require('Controls/_tileOld/TreeTileView/TreeTileView');

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
