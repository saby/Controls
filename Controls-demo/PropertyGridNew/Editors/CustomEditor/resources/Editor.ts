import {Control, TemplateFunction} from 'UI/Base';
import { SyntheticEvent } from 'UICommon/Events';
import Template = require('wml!Controls-demo/PropertyGridNew/Editors/CustomEditor/resources/Editor');
import IEditor from 'Controls/_propertyGrid/IEditor';
import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';

class Editor extends Control implements IEditor {
    protected _template: TemplateFunction = Template;
    protected _value: unknown = null;

    protected _beforeMount(options?: IEditorOptions): void {
        this._value = options.propertyValue;
    }

    protected _beforeUpdate(options?: IEditorOptions): void {
        if (this._options.propertyValue !== options.propertyValue) {
            this._value = options.propertyValue;
        }
    }

    protected _handleInputCompleted(event: SyntheticEvent, value: number): void {
        this._notify('propertyValueChanged', [value], {bubbling: true});
    }
}
export default Editor;
