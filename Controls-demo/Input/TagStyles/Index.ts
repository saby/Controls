import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/TagStyles/TagStyles');
import 'css!Controls-demo/Controls-demo';

class TagStyles extends Control<IControlOptions> {
    protected _primaryValue = TagStyles._defaultValue;
    protected _secondaryValue = TagStyles._defaultValue;
    protected _successValue = TagStyles._defaultValue;
    protected _warningValue = TagStyles._defaultValue;
    protected _dangerValue = TagStyles._defaultValue;
    protected _placeholder = 'Tooltip';

    protected _template: TemplateFunction = controlTemplate;

    private static _defaultValue = 'text';
    static _theme: string[] = ['Controls/Classes'];
}
export default TagStyles;
