import {Logger} from 'UI/Utils';
import {default as ValidateContainer, IValidateConfig} from 'Controls/_validate/Container';
import IValidateResult from 'Controls/_validate/interfaces/IValidateResult';
import {scrollToElement} from 'Controls/scroll';
import {delay as runDelayed} from 'Types/function';

/**
 * Класс, регулирующий валидацию формы.
 * @class Controls/_validate/ControllerClass
 * @extends UI/Base:Control
 * @public
 * @author Красильников А.С.
 */

class ControllerClass {
    _validates: ValidateContainer[] = [];
    private _submitPromise: Promise<IValidateResult | Error>;
    private _submitResolve: (res: IValidateResult) => void = null;
    private _submitReject: (res: Error) => void = null;

    addValidator(control: ValidateContainer): void {
        this._validates.push(control);
    }

    removeValidator(control: ValidateContainer): void {
        this._validates = this._validates.filter((validate) => {
            return validate !== control;
        });
    }

    deferSubmit(): Promise<IValidateResult | Error> {
        /**
         * Если метод будет вызван во время цикла синхронизации, то дочерние контролы
         * будут иметь старые опции, а работать должны с новыми. Поэтому откладываем действия до завершения цикла синхронизации.
         * Примеры возникающих ошибок:
         * https://online.sbis.ru/opendoc.html?guid=801ee6cf-7ba0-489d-b69c-60a89f976cec
         * https://online.sbis.ru/doc/6603463e-30fa-47b6-ba06-93b08bdc1590
         * У поля ввода установлена опция trim = 'true', при завершении редактирования будет обработано значение с пробелами,
         * т.к. последовательно произойдет измененние значения поля ввода -> завершение редактирования -> вызов submit -> обновление значения в поле ввода.
         */
        if (!this._submitPromise) {
            this._submitPromise = new Promise((resolve, reject) => {
                this._submitResolve = resolve;
                this._submitReject = reject;
            });
        }
        return this._submitPromise;
    }

    resolveSubmit(): void {
        if (this._submitPromise) {
            const submitResolve = this._submitResolve;
            const submitReject = this._submitReject;
            this._submitResolve = null;
            this._submitReject = null;
            this._submitPromise = null;
            this.submit()
                .then((result: IValidateResult) => {
                    submitResolve(result);
                })
                .catch((error: Error) => {
                    submitReject(error);
                });
        }
    }

    submit(): Promise<IValidateResult | Error> {
        const validatePromises = [];

        // The infobox should be displayed on the first not valid field.
        this._validates.reverse();
        const config: IValidateConfig = {
            hideInfoBox: true
        };
        this._validates.forEach((validate: ValidateContainer) => {
            if (!(validate._options && validate._options.readOnly)) {
                validatePromises.push(validate.validate(config));
            }
        });

        const resultPromise = Promise.all(validatePromises);

        return resultPromise.then((results: IValidateResult) => {
            let key: string;
            let needValid: ValidateContainer;
            let resultCounter: number = 0;

            // Walking through object with errors and focusing first not valid field.
            for (key in this._validates) {
                if (this._validates.hasOwnProperty(key) && !this._validates[key]._options.readOnly) {
                    if (results[resultCounter]) {
                        needValid = this._validates[key];
                    }
                    resultCounter++;
                }
            }
            if (!!needValid) {
                results.hasErrors = true;
                this._activateValidator(needValid);
                // Если контейнер валидации уже активирован, то повторный вызов activate() не подскроллит к нему
                this.scrollToInvalidContainer(needValid);
                runDelayed(() => {
                    needValid.openInfoBox();
                });
            }
            this._validates.reverse();
            return results;
        }).catch((e: Error) => {
            Logger.error('Form: Submit error', this, e);
            return e;
        });
    }

    setValidationResult(): void {
        this._validates.forEach((validate: ValidateContainer) => {
            validate.setValidationResult(null);
        });
    }

    getValidationResult(): IValidateResult {
        const results: IValidateResult = {};
        let i: number = 0;
        this._validates.forEach((validate: ValidateContainer) => {
            results[i++] = validate.isValid();
        });
        return results;
    }

    isValid(): boolean {
        for (const item in this._validates) {
            if (!this._validates[item].isValid()) {
                return false;
            }
        }
        return true;
    }

    destroy(): void {
        this._validates = null;
    }

    scrollToInvalidContainer(element: ValidateContainer): void {
        scrollToElement(element._container);
    }

    private _activateValidator(control: ValidateContainer): void {
        control.activate({enableScrollToElement: true});
    }
}

export default ControllerClass;
