import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Adapter/Mask/Mask');

class Mask extends Control<IControlOptions> {
    protected _valueAdapterMask: string = '874998';
    protected _formatMaskChars: object = {
        d: '[0-9]'
    };

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Mask;
