import {Control} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {factory} from 'Types/chain';
import {Model} from 'Types/entity';
import {object} from 'Types/util';
import ListEditorBase from 'Controls/_filterPanel/Editors/ListBase';

/**
 * Контрол используют в качестве редактора для выбора единичного значения из списка на {@link /doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/filter-view/base-settings/#step-3 панели фильтров}.
 * @class Controls/_filterPanel/Editors/EnumList
 * @extends Core/Control
 * @author Мельникова Е.А.
 * @public
 */
class ListEditor extends ListEditorBase {
    protected _columns: object[] = null;

    protected _handleMarkedKeyChanged(event: SyntheticEvent, value: string|number): void {
        this._notifyPropertyValueChanged(value, this._getTextValue(value));
    }

    protected _handleSelectorResult(result: Model[]): void {
        const item = result.at(0);
        this._notifyPropertyValueChanged(item.get(this._options.keyProperty), item.get(this._options.displayProperty));
    }

    protected _notifyPropertyValueChanged(value: string|number, textValue: string): void {
        const extendedValue = {
            value,
            textValue,
            needColapse: true
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _getTextValue(value: string|number): string {
        const record = this._items.getRecordById(value);
        return record.get(this._options.displayProperty);
    }

    static getDefaultOptions(): object {
        return {
            ...ListEditorBase.getDefaultOptions(),
            ...{
                markerVisibility: false
            }
        };
    }
}
export default ListEditor;
