import {Control, IControlOptions} from 'UI/Base';
import {Model} from 'Types/entity';
import {ISingleSelectableOptions, IItemsOptions} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';

export interface IButtonGroupOptions extends ISingleSelectableOptions, IControlOptions, IItemsOptions<object> {
}
/**
 * @class Controls/_toggle/ButtonGroupBase
 * @extends UI/Base:Control
 * @mixes Controls/_interface/ISingleSelectable
 * @mixes Controls/_interface/IItems
 *
 * @public
 * @author Красильников А.С.
 */

class ButtonGroupBase extends Control<IButtonGroupOptions> {

    protected _onItemClick(event: SyntheticEvent<Event>, item: Model): void {
        if (!this._options.readOnly) {
            this._notify('selectedKeyChanged', [item.get(this._options.keyProperty)]);
        }
    }

    static _theme: string[] = ['Controls/buttons', 'Controls/toggle', 'Controls/Classes'];

    static getDefaultOptions(): IButtonGroupOptions {
        return {
            keyProperty: 'id'
        };
    }
}

export default ButtonGroupBase;
