import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Input/Selection/Selection';


class Selection extends Control<IControlOptions> {
    protected _selectionStart: number = 0;
    protected _selectionEnd: number = 0;
    protected _template: TemplateFunction = template;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Selection;
