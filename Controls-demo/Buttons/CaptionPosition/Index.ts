import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Buttons/CaptionPosition/CaptionPosition');
import 'css!Controls-demo/Controls-demo';

class CaptionPosition extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
}
export default CaptionPosition;
