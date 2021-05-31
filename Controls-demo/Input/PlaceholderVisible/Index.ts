import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/PlaceholderVisible/Index');
import 'css!Controls-demo/Controls-demo';

export default class PlaceholderVisible extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
