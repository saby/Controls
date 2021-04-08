import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/Mover/Extended/CreateDialog/CreateDialog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _folderName: string;
    protected _createButtonClick(): void {
        this._notify('sendResult', [this._folderName], { bubbling: true });
        this._notify('close', [], { bubbling: true });
    }
}
