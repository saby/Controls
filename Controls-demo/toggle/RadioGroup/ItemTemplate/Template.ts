import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/RadioGroup/ItemTemplate/Template');
import {SyntheticEvent} from 'Vdom/Vdom';

class ItemTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _cfg = {
        message: 'Not enough rights',
        targetSide: 'top',
        alignment: 'start'
    };
    private _open(e: SyntheticEvent<MouseEvent>, readOnly: boolean): void {
        if (readOnly === true) {
            this._cfg.target = e.currentTarget;
            this._children.IBOpener.open(this._cfg);
        }
    }
    private _close(e: SyntheticEvent<MouseEvent>): void {
        this._children.IBOpener.close();
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ItemTemplate;
