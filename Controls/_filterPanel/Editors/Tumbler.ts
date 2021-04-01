import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import TumblerTemplate = require('wml!Controls/_filterPanel/Editors/Tumbler');
import {RecordSet} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/filterPanel';

interface ITumblerOptions extends IControlOptions {
    propertyValue: string|number;
    items: RecordSet;
}

interface ITumbler {
    readonly '[Controls/_filterPanel/Editors/Tumbler]': boolean;
}

/**
 * Контрол используют в качестве редактора кнопочного переключателя.
 * @class Controls/_filterPanel/Editors/Tumbler
 * @extends UI/Base:Control
 * @mixes Controls/_toggle/Tumbler
 * @author Мельникова Е.А.
 * @public
 */

class Tumbler extends Control<ITumblerOptions> implements ITumbler {
    readonly '[Controls/_filterPanel/Editors/Tumbler]': boolean = true;
    protected _template: TemplateFunction = TumblerTemplate;

    protected _selectedKeyChangedHandler(event: SyntheticEvent, value: string|number): void {
        const extendedValue = {
            value,
            textValue: this._getTextValue(value)
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _extendedCaptionClickHandler(event: SyntheticEvent): void {
        const value = this._options.items.at(0).getKey();
        this._selectedKeyChangedHandler(event, value);
    }

    private _getTextValue(id: string|number): string {
        const record = this._options.items.getRecordById(id);
        return record.get('caption');
    }
}
export default Tumbler;
