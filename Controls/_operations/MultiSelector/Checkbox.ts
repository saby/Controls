import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_operations/MultiSelector/resources/CheckboxTemplate';
import {IMultiSelectableOptions} from 'Controls/interface';

export interface IMultiSelectorCheckboxOptions extends IMultiSelectableOptions, IControlOptions {
    selectedKeysCount: number | null;
    isAllSelected: boolean;
}

type TCheckboxValue = boolean | null;

/**
 * Контрол, который отображает чекбокс, позволяющий произвести массовую отметку записей в списке.
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list/actions/operations/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_operations.less">переменные тем оформления</a>
 *
 * @class Controls/_operations/MultiSelector/Checkbox
 * @extends Core/Control
 * 
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/operations/MultiSelectorCheckbox/Index
 */

export default class MultiSelectorCheckBox extends Control<IMultiSelectorCheckboxOptions> {
    protected _template: TemplateFunction = template;
    protected _checkboxValue: TCheckboxValue = false;

    protected _beforeMount(options: IMultiSelectorCheckboxOptions): void {
        this._checkboxValue = this._getCheckBoxState(options);
    }

    protected _beforeUpdate(newOptions: IMultiSelectorCheckboxOptions): void {
        if (this._options.selectedKeys !== newOptions.selectedKeys ||
            this._options.selectedKeysCount !== newOptions.selectedKeysCount ||
            this._options.isAllSelected !== newOptions.isAllSelected) {
            this._checkboxValue = this._getCheckBoxState(newOptions);
        }
    }

    protected _onCheckBoxClick(): void {
        const eventName = this._checkboxValue === false ? 'selectAll' : 'unselectAll';
        this._notify('selectedTypeChanged', [eventName], {
            bubbling: true
        });
    }

    private _getCheckBoxState(options: IMultiSelectorCheckboxOptions): TCheckboxValue {
        const hasSelected = options.selectedKeys.length;
        const count = options.selectedKeysCount;
        let result;

        if (hasSelected && options.isAllSelected) {
            result = true;
        } else if (hasSelected && (count > 0 || count === null)) {
            result = null;
        } else {
            result = false;
        }

        return result;
    }

    static _theme: string[] = ['Controls/operations'];
}
