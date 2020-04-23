import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Labels/Labels');

class Labels extends Control<IControlOptions> {
    protected _value = Labels._defaultValue;
    protected _requiredValue = Labels._defaultValue;
    protected _topValue = Labels._defaultValue;
    protected _placeholder = 'Tooltip';

    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    private static _defaultValue = 'text';
    static _theme: string[] = ['Controls/Classes'];
}
export default Labels;
