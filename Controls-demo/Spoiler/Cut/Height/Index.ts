import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/Cut/Height/Index');
import 'css!Controls-demo/Controls-demo';

export default class Height extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
