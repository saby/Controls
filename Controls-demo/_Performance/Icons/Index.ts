import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/_Performance/Icons/Icons';
import 'css!Controls/CommonClasses';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
}
