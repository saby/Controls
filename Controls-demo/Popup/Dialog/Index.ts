import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Popup/Dialog/Template');
import 'wml!Controls-demo/Popup/Opener/resources/footer';

class PopupDialog extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected openDialog(): void {
        this._children.dialog.open({
            opener: this._children.button3,
            closeOnOutsideClick: true,
            templateOptions: {
                draggable: true
            },
            propStorageId: 'draggableDialog',
            maxHeight: 700,
            width: 600,
            minWidth: 500
        });
    }
    protected openModalDialog(): void {
        this._children.dialog.open({
            opener: this._children.button5,
            templateOptions: {
                footerContentTemplate: 'wml!Controls-demo/Popup/Opener/resources/footer',
            },
            modal: true,
            maxHeight: 700,
            width: 600,
            minWidth: 500
        });
    }

    static _styles: string[] = ['Controls-demo/Popup/PopupPage', 'Controls-demo/Popup/Opener/resources/StackHeader'];
}
export default PopupDialog;