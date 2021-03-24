import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operations/Container/Container';

export default class MultiSelector extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
}
