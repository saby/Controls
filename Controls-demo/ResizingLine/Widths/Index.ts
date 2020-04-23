import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/ResizingLine/Widths/Widths');

class Widths extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/ResizingLine/Widths/Width'];

    static _theme: string[] = ['Controls/Classes'];
}

export default Widths;
