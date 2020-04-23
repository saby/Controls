import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/SyncFakeArea/SyncFakeArea');

class SyncFakeArea extends Control<IControlOptions> {
    protected _areaValue: '';

    protected _change(): void {
        this._areaValue = 'Маленький текст';
    }

    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    static _theme: string[] = ['Controls/Classes'];
}

export default SyncFakeArea;
