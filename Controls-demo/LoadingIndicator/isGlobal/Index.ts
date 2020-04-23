import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/LoadingIndicator/isGlobal/IsGlobal');

class IsGlobal extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/LoadingIndicator/IndicatorContainer'];
    static _theme: string[] = ['Controls/Classes'];
    private _firstId = null;

    protected _firstOpen(): void {
        const cfg = {
            id: this._firstId,
            message: 'first indicator text',
            overlay: 'none'
        };
        this._firstId = this._notify('showIndicator', [cfg], {bubbling: true});
        setTimeout(() => {
            this._notify('hideIndicator', [this._firstId], { bubbling: true });
        }, 5000);
    }
    _secondOpen(e, time): void {
        this._children.loadingIndicator.show({});
        setTimeout(function() {
            this._children.loadingIndicator.hide();
        }.bind(this), time);
    }
}
export default IsGlobal;
