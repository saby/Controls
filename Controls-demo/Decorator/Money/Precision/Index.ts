import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Decorator/Money/Precision/Template';

class PrecisionDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _value = '12345.670';

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default PrecisionDemo;
