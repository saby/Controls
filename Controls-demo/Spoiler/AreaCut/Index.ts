import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Spoiler/AreaCut/AreaCut';

class TextAlignments extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _readOnly: boolean;

    protected _toggleReadOnly(): void {
        this._readOnly = !this._readOnly;
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default TextAlignments;
