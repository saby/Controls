import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/SyncFakeArea/SyncFakeArea');
import 'css!Controls-demo/Controls-demo';

class SyncFakeArea extends Control<IControlOptions> {
    protected _areaValue: '';

    protected _change(): void {
        this._areaValue = 'Маленький текст';
    }

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}

export default SyncFakeArea;
