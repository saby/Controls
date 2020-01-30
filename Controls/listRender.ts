import editingTemplate = require('wml!Controls/_listRender/Render/resources/EditInPlace/EditingTemplate');
import moneyEditingTemplate = require('wml!Controls/_listRender/Render/resources/EditInPlace/decorated/Money');
import numberEditingTemplate = require('wml!Controls/_listRender/Render/resources/EditInPlace/decorated/Number');
import itemTemplateWrapper = require('wml!Controls/_listRender/Render/resources/ItemTemplateWrapper');
import itemActionsTemplate = require('wml!Controls/_listRender/Render/resources/ItemActionsTemplate');
import swipeTemplate = require('wml!Controls/_listRender/Render/resources/SwipeTemplate');
import TileItemTemplateWrapper = require('wml!Controls/_listRender/Tile/resources/ItemTemplateWrapper');
import ColumnsItemTemplateWrapper = require('wml!Controls/_listRender/Columns/resources/ItemTemplate');
import groupTemplate = require('wml!Controls/_listRender/Render/resources/GroupTemplate');

export { default as Render, IRenderOptions, IRenderChildren } from 'Controls/_listRender/Render';

export { default as Tile } from 'Controls/_listRender/Tile';
export { default as Columns } from 'Controls/_listRender/Columns';
export { TileItemTemplateWrapper };
export { ColumnsItemTemplateWrapper as ColumnsItemTemplate};

export { default as View } from 'Controls/_listRender/View';
export {
    editingTemplate,
    moneyEditingTemplate,
    numberEditingTemplate,
    itemTemplateWrapper,
    itemActionsTemplate,
    swipeTemplate,
    groupTemplate
};

import ListView = require('wml!Controls/_listRender/ListView');
export { ListView };

import TileView = require('wml!Controls/_listRender/TileView');
import ColumnsView = require('wml!Controls/_listRender/ColumnsView');
export { TileView };
export { ColumnsView };
