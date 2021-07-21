import {Control, TemplateFunction} from 'UI/Base';
import rk = require('i18n!Controls');
import template = require('wml!Controls/_form/ControllerBase/ControllerBase');
import {Model, Record} from 'Types/entity';
import * as cInstance from 'Core/core-instance';
import * as Deferred from 'Core/Deferred';
import IControllerBase from 'Controls/_form/interface/IControllerBase';
import {IFormOperation} from 'Controls/interface';
import {Confirmation} from 'Controls/popup';
import {Container as ValidateContainer, ControllerClass, IValidateResult} from 'Controls/validate';
import {Logger} from 'UI/Utils';

/**
 * Контроллер реализующий базовую функциональность редактирования записи.
 * Следует использовать, если вы хотите редактировать запись без CRUD-источника.
 * Если вам требуется работа с CRUD - используйте {@link Controls/form:Controller}.
 * @remark
 * Для того, чтобы дочерние контролы могли отреагировать на начало сохранения, либо уничтожения контрола, им необходимо зарегистрировать соответствующие обработчики.
 * Обработчики регистрируются через событие registerFormOperation, в аргументах которого ожидается объект с полями
 *
 * * save:Function - вызов происходит перед началом сохранения
 * * cancel:Function - вызов происходит перед показом вопроса о сохранении
 * * isDestroyed:Function - функция, которая сообщает о том, не разрушился ли контрол, зарегистрировавший операцию.
 * В случае, если он будет разрушен - операция автоматически удалится из списка зарегистрированных
 *
 * @class Controls/_form/ControllerBase
 * @extends UI/Base:Control
 * @mixes Controls/form:IControllerBase
 * @public
 * @author Красильников А.С.
 *
 * @demo Controls-demo/FormController/ControllerBase/Index
 */
export default class ControllerBase<T extends IControllerBase> extends Control<T> {
    protected _template: TemplateFunction = template;
    private _pendingPromise: Promise<any>;
    private _formOperationsStorage: IFormOperation[] = [];
    protected _record: Record;
    protected _validateController: ControllerClass = new ControllerClass();
    protected _isConfirmShowed: boolean = false;

    protected _beforeMount(options?: T): void {
        this._setRecord(options.record);
    }

    protected _afterMount(): void {
        this._createChangeRecordPending();
    }

    protected _beforeUpdate(options?: T): void {
        if (options.record && this._record !== options.record) {
            const isEqualId = this._isEqualId(this._record, options.record);
            if (isEqualId) {
                this._setRecord(options.record);
            } else {
                this._confirmRecordChangeHandler(() => {
                    this._setRecord(options.record);
                });
            }
        }
        this._setRecord(options.record);
    }

    protected _afterUpdate(): void {
        this._validateController.resolveSubmit();
    }

    protected _beforeUnmount(): void {
        if (this._pendingPromise) {
            this._pendingPromise.callback();
            this._pendingPromise = null;
        }
        this._validateController.destroy();
        this._validateController = null;
    }

    protected _registerFormOperationHandler(event: Event, operation: IFormOperation): void {
        this._formOperationsStorage.push(operation);
    }

    protected _isEqualId(oldRecord: Record, newRecord: Record): boolean {
        // Пока не внедрили шаблон документа, нужно вручную на beforeUpdate понимать, что пытаются установить тот же
        // рекорд (расширенный). Иначе при смене рекорда будем показывать вопрос о сохранении.
        if (!this._checkRecordType(oldRecord) || !this._checkRecordType(newRecord)) {
            return false;
        }
        const oldId: string = this._getRecordId(oldRecord) as string;
        const newId: string = this._getRecordId(newRecord) as string;
        return oldId === newId || parseInt(oldId, 10) === parseInt(newId, 10);
    }

    protected _getRecordId(record?: Record | Model): number | string {
        let checkedRecord = record;
        if (!checkedRecord) {
            checkedRecord = this._record;
        }
        if (!checkedRecord.getKey && !this._options.keyProperty) {
            Logger.error('FormController: Рекорд не является моделью и не задана опция keyProperty, указывающая на ключевое поле рекорда', this);
            return null;
        }
        return this._options.keyProperty ? checkedRecord.get(this._options.keyProperty) : checkedRecord.getKey();
    }

    protected _setRecord(record: Record): void {
        if (!record || this._checkRecordType(record)) {
            this._record = record;
        }
    }

    protected _checkRecordType(record: Record): boolean {
        return cInstance.instanceOfModule(record, 'Types/entity:Record');
    }

    /**
     * Регистрируем пендинг для показа диалога о сохранении при попытке закрыть диалог с измененной записью
     * @protected
     */
    protected _createChangeRecordPending(): void {
        this._pendingPromise = new Deferred();
        this._notify('registerPending', [this._pendingPromise, {
            showLoadingIndicator: false,
            validate: (): boolean => {
                return this._needShowConfirmation();
            },
            onPendingFail: (forceFinishValue: boolean, deferred: Promise<boolean>): void => {
                this._startFormOperations('cancel').then(() => {
                    this._showConfirmDialog(deferred, forceFinishValue);
                });
            }
        }], {bubbling: true});
    }

    protected _needShowConfirmation(): boolean {
        if (this._options.confirmationShowingCallback) {
            return this._options.confirmationShowingCallback();
        } else {
            return this._record && this._record.isChanged();
        }
    }

    /**
     * Запуск formOperation.
     * Запускаются соответствующие обработчики всех зарегистрированных операций.
     * @param command
     * @protected
     */
    protected _startFormOperations(command: string): Promise<void> {
        const resultPromises: Promise<void>[] = [];
        this._formOperationsStorage = this._formOperationsStorage.filter((operation: IFormOperation) => {
            if (operation.isDestroyed()) {
                return false;
            }
            const result = operation[command]();
            if (result instanceof Promise || result instanceof Deferred) {
                resultPromises.push(result);
            }
            return true;
        });

        return Promise.all(resultPromises);
    }

    protected _showConfirmDialog(def: Promise<boolean>, forceFinishValue: boolean): void {
        if (forceFinishValue !== undefined) {
            this._confirmDialogResult(forceFinishValue, def);
        } else {
            this._showConfirmPopup(
                'yesnocancel',
                rk('Чтобы продолжить редактирование, нажмите \'Отмена\'')
            ).then((answer) => {
                this._confirmDialogResult(answer as boolean, def);
                return answer;
            });
        }
    }

    /**
     * Обработчик ввыбора ответа в диалоге подтверждения закрытия диалога.
     * При положительном ответе - пытаемся сохранить.
     * При отрицательном - даем закрыть без сохранения изменений.
     * При отмее - прерываем закрытие..
     * @param answer
     * @param def
     * @protected
     */
    protected _confirmDialogResult(answer: boolean, def: Promise<any>): void {
        if (answer === true) {
            this.update().then(
                (res) => {
                    if (!res.validationErrors) {
                        // если нет ошибок в валидации, просто завершаем пендинг с результатом
                        if (!def.isReady()) {
                            this._pendingPromise = null;
                            def.callback(res);
                        }
                    } else {
                        /*
                           если валидация не прошла, нам нужно оставить пендинг,
                           но отменить ожидание завершения пендинга,чтобы оно не сработало, когда пендинг завершится.
                           иначе попробуем закрыть панель,
                           не получится, потом сохраним рекорд и панель закроется сама собой
                         */
                        this._notify('cancelFinishingPending', [], {bubbling: true});
                    }
                    return res;
                },
                () => {
                    this._notify('cancelFinishingPending', [], {bubbling: true});
                }
            );
        } else if (answer === false) {
            if (!def.isReady()) {
                this._pendingPromise = null;
                def.callback(false);
            }
        } else {
            // if user press 'cancel' button, then cancel finish pendings
            this._notify('cancelFinishingPending', [], {bubbling: true});
        }
    }

    protected _showConfirmPopup(type: string, details?: string): Promise<string | boolean> {
        return Confirmation.openPopup({
            message: rk('Сохранить изменения?'),
            details,
            type
        });
    }

    protected _confirmRecordChangeHandler(defaultAnswerCallback: Function, negativeAnswerCallback?: Function): void {
        if (this._isConfirmShowed) { // Защита от множ. вызова окна
            return;
        }
        if (this._needShowConfirmation()) {
            this._isConfirmShowed = true;
            this._showConfirmPopup('yesno').then((answer) => {
                if (answer === true) {
                    this.update().then(() => {
                        this._isConfirmShowed = false;
                        defaultAnswerCallback();
                    }, () => {
                        // Промис с необработанным исключением кидает ошибку в консоль. Ставлю заглушку
                    });
                } else {
                    this._isConfirmShowed = false;
                    if (negativeAnswerCallback) {
                        negativeAnswerCallback();
                    } else {
                        defaultAnswerCallback();
                    }
                }
            });
        } else {
            return defaultAnswerCallback();
        }
    }

    protected _onValidateCreated(e: Event, control: ValidateContainer): void {
        this._validateController.addValidator(control);
    }

    protected _onValidateDestroyed(e: Event, control: ValidateContainer): void {
        this._validateController.removeValidator(control);
    }

    update(): Promise<undefined | Record> {
        const updatePromise = this._startFormOperations('save').then(() => {
            return this.validate().then((results: IValidateResult) => {
                if (results.hasErrors) {
                    // если были ошибки валидации, уведомим о них
                    const validationErrors = this._validateController.getValidationResult();
                    this._notify('validationFailed', [validationErrors]);
                    return {
                        data: {
                            validationErrors: results
                        }
                    };
                } else {
                    this._notify('validationSuccessed', []);
                    this._record.acceptChanges();
                    this._notify('updateSuccessed', [this._record]);
                    return results;
                }
            });
        });
        this._notify('registerPending', [updatePromise, { showLoadingIndicator: false }], { bubbling: true });
        return updatePromise;
    }

    validate(): Promise<IValidateResult | Error> {
        // Для чего нужен _forceUpdate см внутри метода deferSubmit
        this._forceUpdate();
        return this._validateController.deferSubmit();
    }
}
