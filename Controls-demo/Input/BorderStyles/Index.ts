import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/BorderStyles/BorderStyles');

class BorderStyles extends Control<IControlOptions> {
    protected _successValue = BorderStyles._defaultValue;
    protected _secondaryValue = BorderStyles._defaultValue;
    protected _warningValue = BorderStyles._defaultValue;
    protected _placeholder = 'Tooltip';

    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    private static _defaultValue = 'text';
    static _theme: string[] = ['Controls/Classes'];
}

export default BorderStyles;
