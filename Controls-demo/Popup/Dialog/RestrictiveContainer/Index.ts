import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Popup/Dialog/RestrictiveContainer/Index');
import {DialogOpener} from 'Controls/popup';

const baseStackConfig = {
    template: 'Controls-demo/Popup/TestDialog',
    closeOnOutsideClick: true,
    autofocus: true,
    opener: null
};

class RestrictiveContainer extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Popup/Dialog/RestrictiveContainer/Index', 'Controls-demo/Controls-demo'];
    private _dialogOpener: DialogOpener;

    protected _afterMount(options?: IControlOptions, contexts?: any): void {
        this._dialogOpener = new DialogOpener();
    }

    protected _openDialogHandler(event: Event, isInsideRestrictive: boolean): void {
        this._dialogOpener.open(baseStackConfig);
    }

    protected _openRestrictiveDialogHandler(): void {
        const config = {...baseStackConfig, ...{restrictiveContainer: '.ControlsDemo-Popup-Dialog__globalContainer'}};
        this._dialogOpener.open(config);
    }
}
export default RestrictiveContainer;
