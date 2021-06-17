import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/Popup/Dialog/Target/Index';
import {DialogOpener} from 'Controls/popup';
import 'css!Controls-demo/Popup/Dialog/Target/Index';

const baseDialogConfig = {
    template: 'Controls-demo/Popup/TestDialog',
    closeOnOutsideClick: true,
    autofocus: true,
    templateOptions: {
        draggable: true
    },
    opener: null
};

class RestrictiveContainer extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = [, 'Controls-demo/Controls-demo'];
    private _dialogOpener: DialogOpener = new DialogOpener();

    protected openDialog(): void {
        baseDialogConfig.target = this._children.dialogButton;
        this._dialogOpener.open(baseDialogConfig);
    }

    protected openDialogWithOffset1(): void {
        const config = {...baseDialogConfig};
        config.target = this._children.dialogButtonWithOffset1;
        config.offset = {
            vertical: 20,
            horizontal: 10
        };
        this._dialogOpener.open(config);
    }

    protected openDialogWithOffset2(): void {
        const config = {...baseDialogConfig};
        config.target = this._children.dialogButtonWithOffset2;
        config.className = 'Controls-demo__DialogTargetOffset';
        this._dialogOpener.open(config);
    }
}
export default RestrictiveContainer;
