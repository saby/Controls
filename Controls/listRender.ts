import editingTemplate = require('wml!Controls/_listRender/Render/resources/EditInPlace/EditingTemplate');
import moneyEditingTemplate = require('wml!Controls/_listRender/Render/resources/EditInPlace/decorated/Money');
import numberEditingTemplate = require('wml!Controls/_listRender/Render/resources/EditInPlace/decorated/Number');
import itemTemplateWrapper = require('wml!Controls/_listRender/Render/resources/ItemTemplateWrapper');
import groupTemplate = require('wml!Controls/_listRender/Render/resources/GroupTemplate');

export { default as Render, IRenderOptions, IRenderChildren, ISwipeEvent } from 'Controls/_listRender/Render';

export { default as View } from 'Controls/_listRender/View';
export {
    editingTemplate,
    moneyEditingTemplate,
    numberEditingTemplate,
    itemTemplateWrapper,
    groupTemplate
};

import ListView = require('wml!Controls/_listRender/ListView');
export { ListView };
