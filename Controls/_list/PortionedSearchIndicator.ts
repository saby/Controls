import {Control, TemplateFunction} from 'UI/Base';
import * as PortionedSearchIndicatorTemplate from 'wml!Controls/_list/PortionedSearchIndicator';

export default class PortionedSearchIndicator extends Control {
    protected _template: TemplateFunction = PortionedSearchIndicatorTemplate;

    protected _onContinueSearchClick(): void {
        this._notify('continueSearchClick');
    }

    protected _onAbortSearchClick(): void {
        this._notify('abortSearchClick');
    }
}