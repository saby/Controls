import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as BooleanTemplate from 'wml!Controls/_filterPanel/Editors/Boolean';
import 'css!Controls/filterPanel';

export interface IBooleanEditorOptions extends IControlOptions {
    propertyValue: boolean;
}

class BooleanEditor extends Control<IBooleanEditorOptions> {
    protected _template: TemplateFunction = BooleanTemplate;

    protected _handleExtendedCaptionClick(): void {
        const extendedValue = {
            value: true
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }
}

export default BooleanEditor;
