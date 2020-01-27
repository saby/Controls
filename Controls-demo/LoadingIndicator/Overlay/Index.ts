import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/LoadingIndicator/Overlay/Overlay');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/LoadingIndicator/IndicatorContainer';

class Overlay extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _theme: string[] = ['Controls/Classes'];
    _afterMount(): void {
        this._children.LocalIndicatorDefault.show({});
        this._children.LocalIndicatorNone.show({});
        this._children.LocalIndicatorDark.show({});
    }
}
export default Overlay;
