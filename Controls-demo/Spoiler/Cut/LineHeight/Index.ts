import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/Cut/LineHeight/LineHeight');
import 'Controls/buttons';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Spoiler/Cut/LineHeight/LineHeight';

export default class LineHeight extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
