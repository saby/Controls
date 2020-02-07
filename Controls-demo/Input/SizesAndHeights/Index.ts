import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/SizesAndHeights/SizesAndHeights');
import 'css!Controls-demo/Controls-demo';

class SizesAndHeights extends Control<IControlOptions> {
    protected _sizeAndHeightXSValue = SizesAndHeights._defaultValue;
    protected _sizeAndHeightSValue = SizesAndHeights._defaultValue;
    protected _sizeAndHeightMValue = SizesAndHeights._defaultValue;
    protected _sizeAndHeightLValue = SizesAndHeights._defaultValue;
    protected _sizeAndHeightXLValue = SizesAndHeights._defaultValue;
    protected _sizeAndHeight2XLValue = SizesAndHeights._defaultValue;
    protected _sizeAndHeight3XLValue = SizesAndHeights._defaultValue;
    protected _sizeAndHeight4XLValue = SizesAndHeights._defaultValue;
    protected _placeholder = 'Tooltip';

    protected _template: TemplateFunction = controlTemplate;

    private static _defaultValue = 'text';
    static _theme: string[] = ['Controls/Classes'];
}

export default SizesAndHeights;
