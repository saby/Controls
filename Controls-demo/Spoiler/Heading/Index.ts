import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/Heading/Heading');
import 'css!Controls-demo/Controls-demo';

class Heading extends Control<IControlOptions> {
    protected _expanded: boolean = true;

    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
}
export default Heading;
