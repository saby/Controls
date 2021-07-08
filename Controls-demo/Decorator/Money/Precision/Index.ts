import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Decorator/Money/Precision/Template';

class PrecisionDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _value: string = '12345.67';

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default PrecisionDemo;
