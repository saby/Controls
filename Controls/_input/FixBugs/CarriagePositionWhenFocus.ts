/**
 * Коллбек функция обновления позиции каретки на правильную.
 * @return изменилась ли позиция каретки.
 */
export type TUpdatePositionCallback = () => boolean;

/**
 * Класс для исправления бага не правильной позици каретки при фокусировке.
 * Позиция должна соответствовать стандарту полей ввода.
 * Причина: позиция каретки при создании заполненного нативного поля ввода определяется
 * браузером. Например в chrome, firefox, IE10-11 она в начале. Это не соответсвует поведению по стандарту.
 * Решение: при фокусировке по tab менять позицию каретки на правильную.
 */
export class CarriagePositionWhenFocus {
    private _firstFocusByTab: boolean = true;
    private _updatePositionCallback: TUpdatePositionCallback;

    constructor(updatePositionCallback: TUpdatePositionCallback) {
        this._updatePositionCallback = updatePositionCallback;
    }

    /**
     * @return изменилась ли позиция каретки.
     */
    focusHandler(): boolean {
        if (this._firstFocusByTab) {
            this._firstFocusByTab = false;
            return this._updatePositionCallback();
        }

        return false;
    }

    mouseDownHandler(): void {
        this._firstFocusByTab = false;
    }

    /**
     * Обрабатывает изменение режива редактирования поля ввода.
     * @remark
     * Верстка меняется в зависимости от значения опции readOnly. В режиме чтения рисуется <div>, в режиме
     * редактирования <input>. Поэтому при смене режима на редактирование, появится баг.
     */
    editingModeWasChanged(oldReadOnly: boolean, newReadOnly: boolean): void {
        if (oldReadOnly === true && newReadOnly === false) {
            this._firstFocusByTab = true;
        }
    }
}
