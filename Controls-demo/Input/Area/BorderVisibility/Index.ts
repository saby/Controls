import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/Input/Area/BorderVisibility/Index';
import 'css!Controls-demo/Controls-demo';

export default class BorderVisibility extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
