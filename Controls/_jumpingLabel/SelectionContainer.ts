import Base, {IBaseOptions} from './Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';
import {ISingleSelectable, ISingleSelectableOptions, IMultiSelectable, IMultiSelectableOptions} from 'Controls/interface';

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_jumpingLabel/SelectionContainer/SelectionContainer';

export interface ISelectionContainerOptions extends IBaseOptions, ISingleSelectableOptions, IMultiSelectableOptions {}

/**
 * Контрол, отображающий подсказку рядом со своим контентом. Если в контентной области нет данных, подсказка отображается как placeholder.
 * @remark
 * Используется с контролами, поддерживающими интерфейс {@link Controls/interface/IMultiSelectable IMultiSelectable}
 * Полезные ссылки
 * * {@link /materials/Controls-demo/app/Controls-demo%2FJumpingLabel%2FStandard%2FIndex демо-пример}
 * * {@link http://axure.tensor.ru/StandardsV8/%D0%BF%D0%BE%D0%BB%D1%8F_%D0%B2%D0%B2%D0%BE%D0%B4%D0%B0.html Стандарт}
 *
 * @class Controls/_jumpingLabel/SelectionContainer
 * @extends Controls/_jumpingLabel/Base
 *
 * @public
 *
 * @author Красильников А.С.
 */

class SelectionContainer extends Base<ISelectionContainerOptions> implements ISingleSelectable, IMultiSelectable {
    private _hasKeys: boolean = null;

    protected _template: TemplateFunction = template;

    readonly '[Controls/_interface/IMultiSelectable]': boolean = true;
    readonly '[Controls/_interface/ISingleSelectable]': boolean = true;

    protected _setShowFromAbove(options: ISelectionContainerOptions): void {
        if ('selectedKey' in options) {
            this._showFromAbove = true;
            return;
        }
        if ('selectedKeys' in options) {
            this._showFromAbove = Boolean(options.selectedKeys.length);
            return;
        }

        this._showFromAbove = false;
        return;
    }

    private _valueChangedHandler(event: SyntheticEvent, value: string): void {
        if (!this._hasKeys) {
            this._showFromAbove = Boolean(value);
        }
    }

    private _selectedChangedHandler(event: SyntheticEvent, keys: any[]): void {
        const hasKeys: boolean = Boolean(keys.length);
        this._hasKeys = hasKeys;
        this._showFromAbove = hasKeys;
    }
}

export default SelectionContainer;
