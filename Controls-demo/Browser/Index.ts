import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Browser/Browser';
import 'css!Controls-demo/Controls-demo';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
}
