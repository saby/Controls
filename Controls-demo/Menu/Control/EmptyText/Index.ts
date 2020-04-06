import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/EmptyText/Index');
import 'css!Controls-demo/Controls-demo';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
