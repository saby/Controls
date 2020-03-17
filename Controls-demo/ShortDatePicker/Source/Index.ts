import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import DateLitePopupSource from "./DateLitePopupSource";
import template = require("wml!Controls-demo/ShortDatePicker/Source/Source");
import 'css!Controls-demo/Controls-demo';

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _source: Record = new DateLitePopupSource();
}

export default DemoControl;
