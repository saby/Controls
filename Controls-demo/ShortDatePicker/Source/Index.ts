import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import DateLitePopupSource from "./DateLitePopupSource";
import template = require("wml!Controls-demo/ShortDatePicker/Source/Source");

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _source: Record = new DateLitePopupSource();

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
