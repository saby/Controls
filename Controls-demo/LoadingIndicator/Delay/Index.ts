import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/LoadingIndicator/Delay/Delay');

class Delay extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    _openFirst(e, time): void {
        this._children.loadingIndicatorFirst.show({});
        setTimeout(function() {
            this._children.loadingIndicatorFirst.hide();
        }.bind(this), time);
    }
    _openSecond(e, time): void {
        this._children.loadingIndicatorSecond.show({});
        setTimeout(function() {
            this._children.loadingIndicatorSecond.hide();
        }.bind(this), time);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/LoadingIndicator/IndicatorContainer'];
}
export default Delay;
