import Base, {IBaseOptions} from './Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_jumpingLabel/InputContainer/InputContainer';

export interface IInputContainerOptions extends IBaseOptions {
    value: null | string;
}

/**
 * Контрол, отображающий подсказку рядом с полем ввода. Если в поле ввода нет данных, подсказка отображается как placeholder.
 * @remark
 * Используется с контролами, поддерживающими интерфейс {@link Controls/_input/interface/IValueOptions IValue}.
 * Полезные ссылки
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FJumpingLabel%2FStandard%2FIndex">Демо-пример</a>
 * * <a href="http://axure.tensor.ru/StandardsV8/%D0%BF%D0%BE%D0%BB%D1%8F_%D0%B2%D0%B2%D0%BE%D0%B4%D0%B0.html">Стандарт</a>
 *
 * @class Controls/_jumpingLabel/InputContainer
 * @extends Controls/_jumpingLabel/Base
 *
 * @public
 * @demo Controls-demo/JumpingLabel/Index
 *
 * @author Красильников А.С.
 */
class InputContainer extends Base<IInputContainerOptions> {
    protected _template: TemplateFunction = template;

    protected _setShowFromAbove(options: IInputContainerOptions): void {
        this._showFromAbove = Boolean(options.value);
    }

    private _valueChangedHandler(event: SyntheticEvent, inputValue: any, inputDisplayValue: string): void {
        this._showFromAbove = Boolean(inputDisplayValue);
    }
}

export default InputContainer;
