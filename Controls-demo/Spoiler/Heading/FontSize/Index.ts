import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/Heading/FontSize/FontSize');
import 'css!Controls-demo/Controls-demo';

class FontSize extends Control<IControlOptions> {
    private _expandedM: boolean = true;
    private _expandedL: boolean = true;
    private _captions: string = 'Заголовок';

    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
}
export default FontSize;
