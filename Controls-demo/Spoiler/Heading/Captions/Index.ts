import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/Heading/Captions/Captions');

class Captions extends Control<IControlOptions> {
    protected _expanded1: boolean = true;
    protected _expanded2: boolean = true;

    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    static _theme: string[] = ['Controls/Classes'];
}
export default Captions;
