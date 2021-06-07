import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/datePopup/SelectionType/Template');

class Component extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];

    protected _beforeMount() {
        this._startValueRange = new Date(2019, 0, 1);
        this._endValueRange = new Date(2019, 0, 18);
        this._startValueSingle =  new Date(2019, 0, 5);
        this._endValueSingle = new Date(2019, 0, 5);
        this._startValueDisable = new Date(2019, 0, 5);
        this._endValueDisable = new Date(2019, 0, 10);
        this._startValueQuantum1 = new Date(2019, 0, 5);
        this._endValueQuantum1 = new Date(2019, 0, 5);
        this._startValueQuantum2 = new Date(2019, 0, 5);
        this._endValueQuantum2 = new Date(2019, 0, 7);
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Component;
