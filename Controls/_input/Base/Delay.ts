export interface IDelay<T extends Function> {
    callback: T;
    run(): void;
    lock(): void;
    unlock(): void;
}

/**
 * Класс реализующий логику работы с отложенным вызовом {@link callback}.
 * Экземпляр может находится в состоянии {@link lock заблокирован} или {@link unlock разблокирован}.
 * Вызывая callback в разблокированном состоянии, он будет выполнен сразу, а в заблокирован отложен до момента разблокировки.
 * @remark
 * Используется для решения проблемы рассинхронизации значения в полях ввода между VDOM и моделью контрола.
 * На каждый пользовательский ввод происходит изменение значения модели и <input/>. Новое значение сообщается родителю, происходит
 * цикл обновления VDOM. Между _beforeUpdate и _afterUpdate применяются опции от родителя. В этот момент может сработать обработчик
 * ввода, тогда значение изменится, а после _afterUpdate оно будет затерто старым.
 * Решением является отлажить применение изменений контролом в момент обновления VDOM.
 */
export default class Delay<T extends Function> implements IDelay<T> {
    private _locked: boolean = false;
    private _wasAttemptToCallCallback: boolean = false;

    callback: T;

    run(): void {
        if (this._locked) {
            this._wasAttemptToCallCallback = true;
        } else {
            this.callback();
        }
    }

    lock(): void {
        this._locked = true;
    }

    unlock(): void {
        this._locked = false;
        if (this._wasAttemptToCallCallback) {
            this.callback();
            this._wasAttemptToCallCallback = false;
        }
    }
}
