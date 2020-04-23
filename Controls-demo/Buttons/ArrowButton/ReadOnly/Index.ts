import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Buttons/ArrowButton/ReadOnly/ReadOnly');

class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    static _theme: string[] = ['Controls/Classes'];
}
export default Demo;
