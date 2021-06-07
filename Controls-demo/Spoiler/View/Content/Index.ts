import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/View/Content/Content');

class Content extends Control<IControlOptions> {
    protected _captions: string = 'Заголовок';
    protected _innerCaptions: string = 'Вложенный заголовок';
    protected _expanded: boolean = true;
    protected _expanded1: boolean = false;
    protected _expanded2: boolean = true;

    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Content;
