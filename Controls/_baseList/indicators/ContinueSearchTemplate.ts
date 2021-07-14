import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls/_baseList/indicators/ContinueSearchTemplate';

export default class ContinueSearchTemplate extends Control {
    protected _template: TemplateFunction = Template;

    protected _onContinueSearchClick(): void {
        this._notify('continueSearchClick');
    }
}