import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/LoadingIndicator/Small/Small');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/LoadingIndicator/IndicatorContainer';

class Small extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _theme: string[] = ['Controls/Classes'];
    _afterMount(): void {
        this._children.LocalIndicatorDefault.show({});
        this._children.LocalIndicatorSmall.show({});
    }
}
export default Small;
