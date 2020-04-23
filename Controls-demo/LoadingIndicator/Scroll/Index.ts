import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/LoadingIndicator/Scroll/Scroll');

class Scroll extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/LoadingIndicator/IndicatorContainer'];
    static _theme: string[] = ['Controls/Classes'];
    _afterMount(): void {
        this._children.LocalIndicatorDefault.show({});
        this._children.LocalIndicatorRight.show({});
        this._children.LocalIndicatorLeft.show({});
        this._children.LocalIndicatorTop.show({});
        this._children.LocalIndicatorBottom.show({});
    }
}
export default Scroll;
