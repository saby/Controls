import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/LoadingIndicator/Delay/Delay');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/LoadingIndicator/IndicatorContainer';

class Delay extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _theme: string[] = ['Controls/Classes'];
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
}
export default Delay;
