import {Control} from 'UI/Base';
import template = require('wml!Controls/_filterPanel/BaseEditor');
import {IControlOptions, TemplateFunction} from 'UI/Base';
import 'css!Controls/filterPanel';

export default class View extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
}
