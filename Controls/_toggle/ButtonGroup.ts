import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// @ts-ignore
import template = require('wml!Controls/_toggle/ButtonGroup/ButtonGroup');
import {Model} from 'Types/entity';
import {ISingleSelectableOptions} from 'Controls/interface';
import {IItems} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ButtonTemplate} from 'Controls/buttons';

export interface IButtonGroupOptions extends ISingleSelectableOptions, IControlOptions, IItems {
}
/**
 * Контрол представляет собой набор из нескольких взаимосвязанных между собой кнопок. Используется, когда необходимо выбрать один из нескольких параметров.
 * @class Controls/_toggle/ButtonGroup
 * @extends UI/Base:Control
 * @mixes Controls/_interface/ISingleSelectable
 * @mixes Controls/_interface/IItems
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/toggle/ButtonGroup/Index
 */

class ButtonGroup extends Control<IButtonGroupOptions> {
    protected _template: TemplateFunction = template;
    protected _buttonTemplate: TemplateFunction = ButtonTemplate;

    protected _onItemClick(event: SyntheticEvent<Event>, item: Model): void {
        this._notify('selectedKeyChanged', [item.get(this._options.keyProperty)]);
    }

    static _theme: string[] = ['Controls/buttons', 'Controls/toggle', 'Controls/Classes'];

    static getDefaultOptions(): IButtonGroupOptions {
        return {
            keyProperty: 'id'
        };
    }
}

export default ButtonGroup;
