import tmpl = require('wml!Controls/_Pending/Pending');
import {default as PendingClass, IPendingConfig} from 'Controls/_Pending/PendingClass';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';

/**
 * Контрол, отслеживающий выполнение необходимых действий, которые должны быть завершены до начала текущего действия.
 * Текущее действие запрашивает экземпляр класса Promise, который будет завершен после того, как завершатся все необходимые действия.
 * Например, всплывающее окно должно быть закрыто только после сохранения/не сохранения измененных данных, которые содержит это всплывающее окно.
 *
 * Pending - это зарегистрированное в текущем экземпляре класса Controls/Pending необходимое действие, которое должно завершиться до начала текущего действия.
 * Поэтому все пендинги должны быть завершены для разблокировки и запуска следующего действия.
 * @remark
 * Controls/Pending может запросить подтверждение перед закрытием вкладки/браузера, если пендинг зарегистрирован.
 * Controls/Pending имеет собственный LoadingIndicator, который может отображаться во время завершения пендинга. Этот {@link /docs/js/Controls/Container/LoadingIndicator/ LoadingIndicator} имеет параметры по умолчанию.
 * В момент, когда будет зарегистрирован первый пендинг с параметром showLoadingIndicator = true, LoadingIndicator отобразит индикатор.
 * В момент, когда последний пендинг с параметром showLoadingIndicator = true завершится, индикатор скроется.
 *
 * Controls/Pending обрабатывает 2 события: registerPending и cancelFinishingPending.
 *
 * registerPending - регистрация пендинга
 * registerPending имеет 2 аргумента: [promise, config].
 * promise - пендинг будет отменен, когда Promise будет завершен.
 * config - это объект с параметрами:
 *    - showLoadingIndicator (Boolean) - показывать индикатор загрузки или нет (во время регистрации пендинга)
 *    - onPendingFail (Function) - будет вызвана при попытке завершить пендинг (вызовы finishPendingOperations).
 *    Функция помогает завершить Promise. Пользователь должен завершить Promise (второй аргумент) в этой функции.
 *    Это может быть синхронное или асинхронное завершение.
 *
 * onPendingFail имеет 2 аргумента - [forceFinishValue, resultPromise].
 * forceFinishValue дает дополнительную информацию о завершении Promise.
 * resultPromise - Promise, по завершению которого завершается пендинг. Мы должны завершить его в функции onPendingFail.
 * forceFinishValue берется из аргумента finishPendingOperations (finishPendingOperations дает дополнительную информацию о завершении).
 * Пользователь может использовать этот аргумент в своей собственной функции onPendingFail.
 * Например, если в пендинге зарегистрирована измененная запись и нам нужно сохранить изменения, по умолчанию мы можем запросить подтверждение сохранения.
 * Но forceFinishValue может завершаться принудительно без подтверждения сохранения.
 *
 * cancelFinishingPending - отменяет Promise, который возвращен finishPendingOperations. Этот Promise никогда не завершится.
 * Полезно использовать, когда пендинг не может быть завершен сейчас, но будет завершен позднее другим способом.
 * Например, когда всплывающее окно ожидает завершения пендингов перед закрытием, но запись не может быть сохранена из-за ошибок валидации.
 * В этом случае, если мы не отменим Promise с помощью finishPendingOperations, всплывающеe окно будет закрыто позже, когда будут исправлены ошибки валидации.
 * Тогда окно закроется неожиданно для пользователя, который, возможно, не хотел его закрывать.
 *
 * @class Controls/Pending
 * @extends UI/Base:Control
 *
 * @author Красильников А.С.
 * @public
 */

export {PendingClass, IPendingConfig};

export default class Pending extends Control<IControlOptions> {
    _template: TemplateFunction = tmpl;

    protected _pendingController: PendingClass = null;

    _beforeMount(): void {
        const pendingOptions = {
            notifyHandler: (eventName: string, args?: []) => {
                return this._notify(eventName, args, {bubbling: true});
            }
        };
        this._pendingController = new PendingClass(pendingOptions);
    }

    _beforeUnmount(): void {
        this._pendingController.destroy();
    }

    _registerPendingHandler(event: SyntheticEvent, def: Promise<void>, config: object = {}): void {
        this._pendingController.registerPending(def, config);
    }

    _unregisterPending(root: string, id: number): void {
        this._pendingController.unregisterPending(root, id);
    }

    _hasPendings(): void {
        this._pendingController.hasPendings();
    }

    _hasRegisteredPendings(root: string = null): boolean {
        return this._pendingController.hasRegisteredPendings(root);
    }

    _hideIndicators(root: string): void {
        this._pendingController.hideIndicators(root);
    }

    _finishPendingHandler(event: SyntheticEvent, forceFinishValue: boolean, root: string): Promise<unknown> {
        return this._pendingController.finishPendingOperations(forceFinishValue, root);
    }

    /**
     * Метод вернет завершенный Promise, когда все пендинги будут завершены.
     * Функции обратного вызова Promise с массивом результатов пендингов.
     * Если один из Promise'ов пендинга будет отклонен (вызовется errback), Promise также будет отклонен с помощью finishPendingOperations.
     * Если finishPendingOperations будет вызываться несколько раз, будет актуален только последний вызов, а другие возвращенные Promise'ы будут отменены.
     * Когда finishPendingOperations вызывается, каждый пендинг пытается завершится путем вызова метода onPendingFail.
     * @param forceFinishValue этот аргумент используется в качестве аргумента onPendingFail.
     * @returns {Deferred} Завершение Promise'а, когда все пендинги будут завершены.
     */

    finishPendingOperations(forceFinishValue?: boolean, root: string = null): Promise<unknown> {
        return this._pendingController.finishPendingOperations(forceFinishValue, root);
    }

    _cancelFinishingPendingHandler(event: SyntheticEvent, root: string): void {
        return this._pendingController.cancelFinishingPending(root);
    }
}
/**
 * @event Происходит в момент, когда в Controls/Pending не останется пендингов.
 * (после того, как последний пендинг завершится).
 * @name Controls/Pending#pendingsFinished
 * @param {SyntheticEvent} eventObject.
 */
