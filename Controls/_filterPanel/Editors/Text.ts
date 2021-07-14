import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as TextTemplate from 'wml!Controls/_filterPanel/Editors/Text';
import {BaseEditor} from 'Controls/_filterPanel/Editors/Base';
import 'css!Controls/filterPanel';

export interface ITextEditorOptions extends IControlOptions {
    value: unknown;
}

class TextEditor extends BaseEditor {
    protected _template: TemplateFunction = TextTemplate;

    protected _extendedCaptionClickHandler(): void {
        this._notifyPropertyValueChanged();
    }

    protected _getExtendedValue(): object {
        return this._options.value;
    }
}

export default TextEditor;
