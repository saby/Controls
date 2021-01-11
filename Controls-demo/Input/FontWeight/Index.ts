import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/FontWeight/FontWeight');

class FontStyles extends Control<IControlOptions> {
    protected _defaultValue = FontStyles._defaultValue;
    protected _boldValue = FontStyles._defaultValue;
    protected _placeholder = 'Tooltip';

    protected _template: TemplateFunction = controlTemplate;

    private static _defaultValue = 'text';
    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default FontStyles;
