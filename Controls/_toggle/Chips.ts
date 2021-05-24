import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IItemsOptions, IMultiSelectableOptions} from 'Controls/interface';
import {ButtonTemplate} from 'Controls/buttons';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as template from 'wml!Controls/_toggle/Chips/Chips';

export interface IChipsOptions extends IMultiSelectableOptions, IControlOptions, IItemsOptions<object> {
}

/**
 * Контрол представляет собой набор из нескольких взаимосвязанных между собой кнопок. Используется, когда необходимо выбрать несколько параметров.
 * @class Controls/_toggle/Chips
 * @extends UI/Base:Control
 * @mixes Controls/interface:IMultiSelectable
 * @mixes Controls/interface:IItems
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/toggle/Chips/Index
 */

class Chips extends Control<IChipsOptions> {
    protected _template: TemplateFunction = template;
    protected _buttonTemplate: TemplateFunction = ButtonTemplate;

    protected _onItemClick(event: SyntheticEvent<Event>, item: Model): void {
        const keyProperty = this._options.keyProperty;
        const selectedKeys = [...this._options.selectedKeys];
        const itemIndex = selectedKeys.indexOf(item.get(keyProperty));
        if (itemIndex === -1) {
            selectedKeys.push(item.get(keyProperty));
        } else {
            selectedKeys.splice(itemIndex, 1);
        }
        this._notify('selectedKeysChanged', [selectedKeys]);
    }

    static getDefaultOptions(): IChipsOptions {
        return {
            keyProperty: 'id'
        };
    }
}

Object.defineProperty(Chips, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Chips.getDefaultOptions();
    }
});

export default Chips;
