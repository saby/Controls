import { Control, TemplateFunction } from 'UI/Base';

import template = require('wml!Controls/_listRender/Render/resources/ItemOutputWrapper');

export default class ItemOutputWrapper extends Control {
    protected _template: TemplateFunction = template;
}
