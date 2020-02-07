import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Adapter/Mask/Mask');
import 'css!Controls-demo/Controls-demo';

class Mask extends Control<IControlOptions> {
    protected _valueAdapterMask = '874-998-877546';
    protected _inputCompletedHandler(event: SyntheticEvent<Event>, value) {
        this._valueAdapterMask = value;
    }

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}

export default Mask;
