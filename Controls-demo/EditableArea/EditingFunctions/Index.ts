import {Record} from 'Types/entity';
import {main as editObject} from '../Data';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls-demo/EditableArea/EditingFunctions/EditingFunctions';

class EditingFunctions extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editObject: Record = editObject;

    protected _beginEdit(): void {
        this._children.editingView.beginEdit();
    }

    protected _cancelEdit(): void {
        this._children.editingView.cancelEdit();
    }

    protected _commitEdit(): void {
        this._children.editingView.commitEdit();
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default EditingFunctions;
