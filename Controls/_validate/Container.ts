import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_validate/Container');
import ParallelDeferred = require('Core/ParallelDeferred');
import Deferred = require('Core/Deferred');
import isNewEnvironment = require('Core/helpers/isNewEnvironment');
import {UnregisterUtil, RegisterUtil} from 'Controls/event';
import errorMessage = require('wml!Controls/_validate/ErrorMessage');
import {ValidationStatus} from "Controls/interface";
import {Logger} from 'UI/Utils';

export interface IValidateConfig {
    hideInfoBox?: boolean;
}

interface IValidateContainerOptions extends IControlOptions {
    content?: TemplateFunction;
    validators?: Function[];
    errorTemplate?: TemplateFunction;
}

/**
 * Контрол, регулирующий валидацию своего контента. Валидация запускается вызовом метода {@link Controls/_validate/Container#validate validate}.
 * @remark
 * Подробнее о работе с валидацией читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/forms-and-validation/validation/ здесь}.
 * @class Controls/_validate/Container
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 */

type ValidResult = boolean|null|Promise<boolean>|string[];

class ValidateContainer extends Control<IValidateContainerOptions> {
    _template: TemplateFunction = template;
    _isOpened: boolean = false;
    _contentActive: boolean = false;
    _currentValue: any;
    _validationResult: ValidResult = null;
    _isNewEnvironment: boolean;
    _closeId: number;

    protected _beforeMount(): void {
        this._isNewEnvironment = isNewEnvironment();
    }

    protected _afterMount(): void {
        // Use listener without template.
        // Some people can add style to the container of validation, and some people can add style to the content.
        RegisterUtil(this, 'scroll', this._scrollHandler.bind(this));
        RegisterUtil(this, 'switchArea', this._switchAreaHandler.bind(this));
        this._notify('validateCreated', [this], {bubbling: true});
    }

    protected _beforeUnmount(): void {
        UnregisterUtil(this, 'scroll');
        UnregisterUtil(this, 'switchArea');
        this._notify('validateDestroyed', [this], {bubbling: true});
        if (this._isOpened) {
            this._forceCloseInfoBox();
        }
    }

    /**
     * @typedef {Object} IValidateConfig
     * @description Конфигурация метода validate для контейнеров валидации.
     * @property {Boolean} hideInfobox Позволяет скрыть всплывающую подсказку при проваленной валидации.
     */

    /**
     * Запускает валидацию.
     * @function
     * @name Controls/_validate/Container#validate
     * @param {IValidateConfig} validateConfig
     * @see setValidationResult
     * @see isValid
     */
    validate(validateConfig?: IValidateConfig): Promise<boolean[]> {
        return new Promise((resolve) => {
            const validators = this._options.validators || [];
            this.setValidationResult(null, validateConfig);
            this._callValidators(validators, validateConfig).then((validationResult) => {
                const isValid = validationResult === null;
                if (this._isOpened && isValid) {
                    this._forceCloseInfoBox();
                }
                resolve(validationResult);
            });
        });

    }

    /**
     * Устанавливает результат валидации.
     * @name Controls/_validate/Container#setValidationResult
     * @function
     * @param {null|Boolean|Array.<String>} validationResult Результат валидации.
     * @see isValid
     * @see validate
     */
    setValidationResult(validationResult: ValidResult, config: IValidateConfig = {}): void {
        if (this._validationResult !== validationResult) {
            this._validationResult = validationResult;
            if (!(validationResult instanceof Promise)) {
                this._forceUpdate();
            }
            if (!config.hideInfoBox) {
                if (validationResult) {
                    this._openInfoBox();
                } else if (this._isOpened) {
                    this._closeInfoBox();
                }
            }
        }
    }

    /**
     * Возвращает значение, указывающее, прошла ли проверка валидации содержимого успешно.
     * @name Controls/_validate/Container#isValid
     * @function
     * @returns {Boolean}
     * @see setValidationResult
     * @see validate
     */
    isValid(): boolean {
        return !this._validationResult;
    }

    openInfoBox(): void {
        this._openInfoBox();
    }

    protected _hoverHandler(): void {
        this._clearCloseId();
        if (!this._isOpened) {
            this._openInfoBox();
        }
    }

    protected _focusInHandler(): void {
        this._contentActive = true;
        this._clearCloseId();
        if (!this._isOpened) {
            this._openInfoBox();
        }
    }

    protected _focusOutHandler(): void {
        this._contentActive = false;
    }

    protected _mouseLeaveHandler(): void {
        if (!this.isValid()) {
            this._closeInfoBox();
        }
    }
    protected _valueChangedHandler(event: Event, value: any): void {
        // We clean validation, if the value has changed.
        // But some controls notify valueChanged if the additional data has changed.
        // For example, input fields notify 'valueChanged' , when displayValue has changed, but value hasn't changed.
        if (this._currentValue !== value) {
            this._currentValue = value;
            this._notify('valueChanged', [value]);
            this._cleanValid();
        }
    }

    private _callValidators(validators: Function[], validateConfig?: IValidateConfig) {
        let validationResult = null,
            errors = [],
            validatorResult, validator, resultDeferred, index;

        const parallelDeferred = new ParallelDeferred();
        const validatorsForCheck = [].concat(validators);

        // провалидируем по собственным валидаторам
        for (index in validatorsForCheck) {
            if (validatorsForCheck.hasOwnProperty(index)) {
                validator = validatorsForCheck[index];
                if (typeof validator === 'function') {
                    // если встретили функцию
                    validatorResult = validator();
                } else if (validator instanceof Promise) {
                    // если встретили deferred - значит значение уже провалидировано и ждем результат
                    validatorResult = validator;
                } else {
                    // если что-то еще, считаем что это - ответ валидации
                    validatorResult = !!validator;
                }

                // результат - либо deferred, либо готовое значение
                if (validatorResult instanceof Promise) {
                    parallelDeferred.push(validatorResult);
                } else {
                    if (typeof validatorResult === 'string') {
                        validationResult = validatorResult;
                    } else {
                        validationResult = !!validatorResult;
                    }
                    if (validationResult === false || typeof validatorResult === 'string') {
                        errors.push(validatorResult);
                    }
                }
            }
        }

        resultDeferred = new Deferred();

        // далее, смотрим что возвращают результаты-деферреды
        parallelDeferred.done().getResult().addCallback((results) => {
            let validationResult = null;
            if (typeof results === 'object') {
                for (const resultIndex in results) {
                    // плохие результаты запоминаем в массиве с ошибками
                    if (results.hasOwnProperty(resultIndex)) {
                        let result = results[resultIndex];
                        if (typeof result !== 'string' && !Array.isArray(result)) {
                            result = !!result;
                        }
                        if (result === false || typeof result === 'string') {
                            errors.push(result);
                        } else if (Array.isArray(result)) {
                            errors = result;
                        }
                    }
                }
            }

            // если ошибки были найдены, отдадим их в качестве ответа
            if (errors.length) {
                validationResult = errors;
            }

            this.setValidationResult(validationResult, validateConfig);
            resultDeferred.callback(validationResult);
        }).addErrback((e) => {
            Logger.error('Validate: Validation error', this, e);
        });

        return resultDeferred;
    }

    private _openInfoBox(): void {
        this._clearCloseId();
        if (this._validationResult && this._validationResult.length && !this._isOpened) {
            this._isOpened = true;
            const cfg = {
                target: this._container,
                validationStatus: 'invalid',
                template: this._options.errorTemplate,
                templateOptions: {errors: this._validationResult},
                closeOnOutsideClick: false,
                eventHandlers: {
                    onResult: this._mouseInfoboxHandler.bind(this),
                    onClose: this._closeHandler.bind(this)
                }
            };

            this._callInfoBox(cfg);
        }
    }
    private _callInfoBox(cfg): void {
        // todo https://online.sbis.ru/opendoc.html?guid=dedf534a-3498-4b93-b09c-0f36f7c91ab5
        if (this._isNewEnvironment) {
            this._notify('openInfoBox', [cfg], {bubbling: true});
        } else {
            // Если окружение старое, создаем ManagerWrapper, в котором рисуются dom окна в старом окружении
            // В том числе инфобоксы.
            requirejs(['Controls/popup'], (popup) => {
                popup.BaseOpener.getManager().then(() => {
                    const GlobalPopup = this._getGlobalPopup();
                    if (GlobalPopup) {
                        const event = {
                            target: this._container
                        };
                        GlobalPopup._openInfoBoxHandler(event, cfg);
                    }
                });
            });
        }
    }

    private _getGlobalPopup(): unknown {
        // Получаем обработчик глобальных событий по открытию окон, который на вдом
        // Лежит в application
        const ManagerWrapperControllerModule = 'Controls/Popup/Compatible/ManagerWrapper/Controller';
        if (requirejs.defined(ManagerWrapperControllerModule)) {
            return requirejs(ManagerWrapperControllerModule).default.getGlobalPopup();
        }
    }

    private _closeInfoBox(): void {
        this._closeId = setTimeout(() => {
            this._forceCloseInfoBox();
        }, 300);
    }

    private _clearCloseId(): void {
        if (this._closeId) {
            clearTimeout(this._closeId);
            this._closeId = null;
        }
    }

    private _forceCloseInfoBox(): void {
        const delay = 0;
        if (this._isNewEnvironment) {
            this._notify('closeInfoBox', [delay], {bubbling: true});
        } else {
            // Аналог self._notify('closeInfoBox', [delay], { bubbling: true });, только обработчик
            // Вызывается напрямую, так как события через compoundControl не летят
            const GlobalPopup = this._getGlobalPopup();
            if (GlobalPopup) {
                const event = {
                    target: this._container
                };
                GlobalPopup._closeInfoBoxHandler(event, delay);
            }
        }
        this._isOpened = false;
    }

    private _scrollHandler(): void {
        if (this._isOpened) {
            this._forceCloseInfoBox();
        }
    }

    private _switchAreaHandler(): void {
        // TODO https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
        if (this._isOpened) {
            this._forceCloseInfoBox();
        }
    }

    private _mouseInfoboxHandler(event: Event): void {
        if (event.type === 'mouseenter') {
            this._hoverInfoboxHandler();
        } else if (event.type === 'mouseleave') {
            this._mouseLeaveHandler();
        } else if (event.type === 'close') {
            this._isOpened = false;
        }
    }

    private _closeHandler(): void {
        this._isOpened = false;
    }

    private _hoverInfoboxHandler(): void {
        this._clearCloseId();
    }

    private _cleanValid(): void {
        if (this._validationResult) {
            this.setValidationResult(null);
        }
    }

    protected _getValidStatus(contentActive: boolean): ValidationStatus {
        //ie is not support focus-within
        if (this._isValidResult()) {
            return contentActive ? 'invalidAccent' : 'invalid';
        }
        return 'valid';
    }

    // todo это временный фикс, этот код должен уйти в контрол поля ввода,
    //  валидация уже отдает туда результат валидации, контролу нужно использовать эти данные
    _isValidResult(): boolean {
        return this._validationResult && !(this._validationResult instanceof Promise);
    }

    static _theme: [string] = ['Controls/validate'];

    static getDefaultOptions(): IValidateContainerOptions {
        return {
            errorTemplate: errorMessage
        };
    }
}

export default ValidateContainer;

/**
 * @name Controls/_validate/Container#content
 * @cfg {Content} Контент, который будет провалидирован.
 */
/*
 * @name Controls/_validate/Container#content
 * @cfg {Content} The content to which the logic of validation is added.
 */

/*
 * @name Controls/_validate/Container#validators
 * @cfg {Array.<Function>|Function} The function of validation.
 */
/**
 * @name Controls/_validate/Container#validators
 * @cfg {Array.<Function>|Function} Функция (или массив функций) валидации.
 */

/**
 * @name Controls/_validate/Container#errorTemplate
 * @cfg {Function} Пользовательский шаблон для отображения содержимого окна с ошибкой.
 * @remark Шаблон принимает опцию errors (string[]), содержащую массив сообщений с ошибками.
 * @demo Controls-demo/Validate/ErrorTemplate/Index
 */
