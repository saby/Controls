import {Tag} from '../Types';
import {SyntheticEvent} from 'UI/Vdom';

export interface IConfig {
    tag: Tag;
    displayValue: string;
}

type Handler<T extends Event> = (event: SyntheticEvent<T>, config: IConfig) => void;

/**
 * Класс для эмулирования поведения события {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event change} в полях ввода.
 * Используется чтобы поддержать кросбраузернность события, потому что нативное работает не во всех браузерах.
 * Например, если после пользовательского ввода вернуть предыдущее значение программно https://jsfiddle.net/v6g0fz7u/.
 */
class ChangeEventController {
    /**
     * Отображаемое значение, которое фиксируется для определения вызова обработчика changeHandler.
     * Одним из условий вызова обработчика является то, что текущее значение отличается от зафиксированного.
     * Значение фиксируется после вызова обработчика, или через метод {@link fixed}.
     */
    private _fixedDisplayValue: string;
    /**
     * Обработчик эмулируемого события change, вызывается на blur и keydown (на нажатие "Enter").
     * @see blurHandler
     * @see keyDownHandler
     */
    private _changeHandler: () => void;

    constructor(fixedDisplayValue: string, changeHandler: () => void) {
        this._changeHandler = changeHandler;
        this._fixedDisplayValue = fixedDisplayValue;
    }

    private _callChangeHandler(displayValue: string): void {
        if (this._fixedDisplayValue !== displayValue) {
            this._changeHandler();
            this._fixedDisplayValue = displayValue;
        }
    }

    /**
     * Зафиксировать новое значение. Используется в случаях, когда родитель самостоятельно вызвал обработчик, или его вызов не трубется.
     * Тогда фиксируется текущее значение, чтобы обработчик не вызвался повторно или не вызвался вообще, по событиям blur или keydown.
     */
    fixed(displayValue: string): void {
        this._fixedDisplayValue = displayValue;
    }

    /**
     * Обработчик, который нужно вызвать при уходе фокуса(blur) из поля ввода.
     */
    blurHandler: Handler<FocusEvent> = (event, config) => {
        this._callChangeHandler(config.displayValue);
    };

    /**
     * Обработчик, который нужно вызвать при нажатии клавиши(keydown) в поле ввода.
     */
    keyDownHandler: Handler<KeyboardEvent> = (event, config) => {
        if (ChangeEventController._isTriggeredOnKeyDown(event.nativeEvent.code, config.tag)) {
            this._callChangeHandler(config.displayValue);
        }
    };

    private static _isTriggeredOnKeyDown(code: string, tag: Tag): boolean {
        return code === 'Enter' && tag !== 'textarea';
    }
}

export default ChangeEventController;
