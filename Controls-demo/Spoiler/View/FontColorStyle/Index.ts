import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/View/FontColorStyle/FontColorStyle');

class FontColorStyle extends Control<IControlOptions> {
    protected _captions: string = 'Заголовок';
    protected _expanded1: boolean = false;
    protected _expanded2: boolean = false;
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default FontColorStyle;
