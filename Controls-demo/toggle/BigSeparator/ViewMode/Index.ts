import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/BigSeparator/ViewMode/ViewMode');

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _expandedEllipsis: boolean = false;
    protected _expandedArrow: boolean = false;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Index;
