import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_validate/Controller');
// @ts-ignore
import ValidateContainer = require('wml!Controls/_validate/Container');
import {Logger} from 'UI/Utils';
import {IValidateConfig} from 'Controls/_validate/Container';

interface IValidateResult {
    [key: number]: boolean;

    hasErrors?: boolean;
}

/**
 * Контрол, регулирующий валидацию формы.
 * Валидация запускается при вызове метода {@link Controls/_validate/Controller#submit submit}.
 * @class Controls/_validate/Controller
 * @extends Core/Control
 * @control
 * @public
 * @demo Controls-demo/Input/Validate/FormController
 * @author Красильников А.С.
 */

class Form extends Control<IControlOptions> {
    _template: TemplateFunction = template;
    _validates: ValidateContainer[] = [];

    onValidateCreated(e: Event, control: ValidateContainer): void {
        this._validates.push(control);
    }

    onValidateDestroyed(e: Event, control: ValidateContainer): void {
        this._validates = this._validates.filter((validate) => {
            return validate !== control;
        });
    }

    submit(): Promise<IValidateResult | Error> {
        const validatePromises = [];

        // The infobox should be displayed on the first not valid field.
        this._validates.reverse();
        let config: IValidateConfig = {
            hideInfoBox: true,
        };
        this._validates.forEach((validate: ValidateContainer) => {
            if (!(validate._options && validate._options.readOnly)) {
                //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=2ebc5fff-6c4f-44ed-8764-baf39e4d4958
                validatePromises.push(validate.validate(config));
            }
        });

        const resultPromise = Promise.all(validatePromises);

        this._notify('registerPending', [resultPromise, {showLoadingIndicator: true}], {bubbling: true});
        return resultPromise.then((results: IValidateResult) => {
            let key: string;
            let needValid: boolean;
            let resultCounter: number = 0;

            // Walking through object with errors and focusing first not valid field.
            for (key in this._validates) {
                if (!this._validates[key]._options.readOnly) {
                    if (results[resultCounter]) {
                        needValid = this._validates[key];
                    }
                    resultCounter++;
                }
            }
            if (needValid) {
                results.hasErrors = true;
                this.activateValidator(needValid);
            }
            this._validates.reverse();
            return results;
        }).catch((e: Error) => {
            Logger.error('Form: Submit error', this, e);
            return e;
        });
    }

    activateValidator(control: ValidateContainer): void {
        control.activate({enableScrollToElement: true});
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
}

export default Form;

/**
 * @name Controls/_validate/Controller#content
 * @cfg {Content} Содержимое, к которому добавлена ​​логика валидации.
 */

/**
 * Запускает валидацию.
 * @name Controls/_validate/Controller#submit
 * @function
 * @returns {Deferred}
 * @example
 * WML
 * <pre>
 * <Controls.validate:Controller name="formController">
 *    <ws:content>
 *       <Controls.validate:Container>
 *          <ws:validators>
 *             <ws:Function value="{{_value2}}" >Controls/validate:isRequired</ws:Function>
 *          </ws:validators>
 *          <ws:content>
 *             <Controls.input:Text bind:value="_value2"/>
 *          </ws:content>
 *       </Controls.validate:Container>
 *    </ws:content>
 * </Controls.validate:Controller>
 * <Controls.buttons:Button caption="Submit" on:click="_clickHandler()"
 * </pre>
 * JavaScript
 * <pre>
 *     Control.extend({
 *        ...
 *
 *        _clickHandler: function() {
 *           this._children.formController.submit();
 *        }
 *        ...
 *    });
 * </pre>
 */

/**
 * Возвращает значение, указывающее, прошла ли проверка валидации содержимого успешно.
 * @name Controls/_validate/Controller#isValid
 * @function
 * @returns {Boolean}
 */
