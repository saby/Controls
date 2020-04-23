import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/Heading/FontSize/FontSize');

class FontSize extends Control<IControlOptions> {
    protected _expandedM: boolean = true;
    protected _expandedL: boolean = true;
    protected _captions: string = 'Заголовок';

    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    static _theme: string[] = ['Controls/Classes'];
}
export default FontSize;
