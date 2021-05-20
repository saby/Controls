import { SyntheticEvent } from 'UICommon/Events';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Input/DateBase/DisplayValue/Template';


class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _displayValue: string = '  .  .21';

    protected _onValueChanged(e: SyntheticEvent, value: Date, displayValue: string): void {
        this._displayValue = displayValue;
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
