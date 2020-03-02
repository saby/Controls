import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/Heading/Captions/Captions');
import 'css!Controls-demo/Controls-demo';

class Captions extends Control<IControlOptions> {
    protected _expanded1: boolean = true;
    protected _expanded2: boolean = true;

    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
}
export default Captions;
