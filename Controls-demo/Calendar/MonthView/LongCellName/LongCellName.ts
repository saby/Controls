import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Calendar/MonthView/LongCellName/LongCellName');
import 'css!Controls-demo/Controls-demo';

class LongCellName extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    private _month: Date = new Date(2019, 1);

    static _theme: string[] = ['Controls/Classes'];
}

export default LongCellName;
