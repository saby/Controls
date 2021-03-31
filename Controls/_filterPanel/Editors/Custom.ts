import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as CustomTemplate from 'wml!Controls/_filterPanel/Editors/Custom';
import 'css!Controls/filterPanel';

export interface ICustomEditorOptions extends IControlOptions {
    value: unknown;
}

class CustomEditor extends Control<ICustomEditorOptions> {
    protected _template: TemplateFunction = CustomTemplate;

    protected _handleExtendedCaptionClick(): void {
        this._notify('propertyValueChanged', [this._options.value], {bubbling: true});
    }
}

export default CustomEditor;
