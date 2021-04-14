import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as TextTemplate from 'wml!Controls/_filterPanel/Editors/Text';
import 'css!Controls/filterPanel';

export interface ITextEditorOptions extends IControlOptions {
    value: unknown;
}

class TextEditor extends Control<ITextEditorOptions> {
    protected _template: TemplateFunction = TextTemplate;

    protected _extendedCaptionClickHandler(): void {
        this._notify('propertyValueChanged', [this._options.value], {bubbling: true});
    }
}

export default TextEditor;
