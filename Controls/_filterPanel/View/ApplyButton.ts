import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as rk from 'i18n!Controls';
import * as template from 'wml!Controls/_filterPanel/View/ApplyButton';

export default class ApplyButton extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _applyCaption: string = rk('Применить');

    protected _handleCick(): void {
       this._notify('sendResult', [], {bubbling: true});
    }
}
