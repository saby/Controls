import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/Cut/ContrastBackground/ContrastBackground');
import 'Controls/buttons';

class LineHeight extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default LineHeight;
