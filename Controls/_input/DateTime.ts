import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {constants} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Date as WSDate, DateTime as WSDateTime, Time as WSTime} from 'Types/entity';
import * as Model from 'Controls/_input/DateTime/Model';
import {
    DATE_MASK_TYPE,
    DATE_TIME_MASK_TYPE,
    getMaskType,
    TIME_MASK_TYPE
} from './DateTime/Utils';
import {IBaseOptions} from 'Controls/_input/interface/IBase';
import {IInputDisplayValueOptions, INPUT_MODE} from 'Controls/_input/interface/IInputDisplayValue';
import IDateTimeMask, {IDateTimeMaskOptions} from 'Controls/_input/interface/IDateTimeMask';
import {IInputDateTimeOptions} from 'Controls/_input/interface/IInputDateTime';
import {
    ValueValidators,
    getDefaultOptions as getValueValidatorsDefaultOptions,
    getOptionTypes as getValueValidatorsOptionTypes,
    IValueValidatorsOptions
} from 'Controls/_input/interface/IValueValidators';
import {EventUtils} from 'UI/Events';
import {isValidDate, Container, InputContainer} from 'Controls/validate';
import template = require('wml!Controls/_input/DateTime/DateTime');


export interface IDateBaseOptions extends
    IBaseOptions,
    IControlOptions,
    IInputDateTimeOptions,
    IDateTimeMaskOptions,
    IValueValidatorsOptions,
    IInputDisplayValueOptions {

}

const VALID_PARTIAL_DATE = /^(0{2}| {2})\.(0{2}| {2})\.\d{2,4}$/;

/**
 * Базовое универсальное поле ввода даты и времени. Позволяет вводить дату и время одновременно или по отдельности. Данные вводятся только с помощью клавиатуры.
 * @remark
 * В зависимости от маски может использоваться для ввода:
 * <ol>
 *    <li>даты;</li>
 *    <li>времени;</li>
 *    <li>даты и времени.</li>
 * </ol>
 *
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FInput%2FDateTime%2FDateTime демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/input/date/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_input.less переменные тем оформления}
 *
 * @class Controls/_input/DateTime
 * @extends UI/Base:Control
 * @mixes Controls/input:IInputDateTime
 * 
 * @mixes Controls/input:IDateTimeMask
 * @mixes Controls/interface:IInputTag
 * @mixes Controls/input:IBase
 * @mixes Controls/input:IBorderVisibility
 * @mixes Controls/interface:IInputPlaceholder
 * @mixes Controls/input:IValueValidators
 * @mixes Controls/input:IInputDisplayValueValidators
 *
 *
 * @public
 * @demo Controls-demo/Input/DateTime/DateTime
 * @author Красильников А.С.
 */

class DateTime extends Control<IDateBaseOptions> {
    protected _template: TemplateFunction = template;
    protected _validationContainer: InputContainer | Container;
    protected _proxyEvent: Function = EventUtils.tmplNotify;
    protected _dateConstructor: Date | WSDate;
    protected _controlName: string = 'DateBase';

    protected _formatMaskChars = {
        'D': '[0-9]',
        'M': '[0-9]',
        'Y': '[0-9]',
        'H': '[0-9]',
        'm': '[0-9]',
        's': '[0-9]',
        'U': '[0-9]'
    };

    protected _model: Model;

    protected _validators: Function[] = [];

    protected _beforeMount(options: IDateBaseOptions): void {
        this._updateDateConstructor(options);
        this._updateValidationController(options);
        this._model = new Model({
            ...options,
            dateConstructor: this._dateConstructor
        });
        EventUtils.proxyModelEvents(this, this._model, ['valueChanged']);
        this._model.subscribe('valueChanged', () => {
            this._updateValidators();
        });
        this._updateValidators(options.valueValidators, options.inputMode, options.mask);
    }

    protected _beforeUpdate(options: IDateBaseOptions): void {
        this._updateDateConstructor(options, this._options);
        if (this._options.validateByFocusOut !== options.validateByFocusOut) {
            this._updateValidationController(options);
        }
        if (options.value !== this._options.value || options.displayValue !== this._options.displayValue) {
            this._model.update({
                ...options,
                dateConstructor: this._dateConstructor
            });
        }
        if (this._options.valuevalidators !== options.valueValidators || options.value !== this._options.value ||
                options.displayValue !== this._options.displayValue) {
            this._updateValidators(options.valueValidators, options.inputMode, options.mask);
        }
    }

    protected _inputCompletedHandler(e: SyntheticEvent<KeyboardEvent>, value: Date | WSDate, textValue: string): void {
        e.stopImmediatePropagation();
        this._model.autocomplete(textValue, this._options.autocompleteType, this._options.inputMode);
        this._notify('inputCompleted', [this._model.value, this._model.displayValue]);
    }

    protected _valueChangedHandler(e: SyntheticEvent<KeyboardEvent>, value: Date | WSDate, textValue: string): void {
        // Контроллер валидаторов на той же ноде стреляет таким же событием но без второго аргумента.
        if (textValue !== undefined) {
            this._model.textValue = textValue;
        }
        e.stopImmediatePropagation();
    }

    validate(): void {
        // Возвращаем результат валидации для совместимости со старыми формами.
        return this._children.validator.validate();
    }

    setValidationResult(validationResult): void {
        this._children.validator.setValidationResult(validationResult);
    }

    protected _onKeyDown(event: SyntheticEvent<KeyboardEvent>): void {
        let key = event.nativeEvent.keyCode;
        if (key === constants.key.insert && !event.nativeEvent.shiftKey && !event.nativeEvent.ctrlKey) {
            // on Insert button press current date should be inserted in field
            this._model.setCurrentDate();
            this._notify('inputCompleted', [this._model.value, this._model.textValue]);
        }
        if (key === constants.key.plus || key === constants.key.minus) {
            // on +/- buttons press date should be increased or decreased in field by one day if date is not empty
            if (this._model.value) {
                let delta = key === constants.key.plus ? 1 : -1;
                let localDate = new this._dateConstructor(this._model.value);
                localDate.setDate(this._model.value.getDate() + delta);
                this._model.value = localDate;
            }
        }
    }

    protected _beforeUnmount(): void {
        this._model.destroy();
    }

    private _updateDateConstructor(options, oldOptions): void {
        if (!oldOptions || options.mask !== oldOptions.mask) {
            this._dateConstructor = options.dateConstructor || this._getDateConstructor(options.mask);
        }
    }

    private _getDateConstructor(mask: string): Function {
        const dateConstructorMap = {
            [DATE_MASK_TYPE]: WSDate,
            [DATE_TIME_MASK_TYPE]: WSDateTime,
            [TIME_MASK_TYPE]: WSTime
        };
        return dateConstructorMap[getMaskType(mask)];
    }

    private _updateValidators(validators?: ValueValidators, inputMode?: string, mask?: string): void {
        const iMode = inputMode || this._options.inputMode;
        const v: ValueValidators = validators || this._options.valueValidators;
        this._validators = [];

        const needValidateForPartialMode =
            getMaskType(mask) !== DATE_MASK_TYPE || !this._model.displayValue.match(VALID_PARTIAL_DATE);

        if (iMode !== INPUT_MODE.partial || needValidateForPartialMode) {
            this._validators.push(isValidDate.bind(null, {
                value: this._model.value
            }));
        }

        this._validators = this._validators.concat(
            v.map((validator) => {
                let _validator: Function;
                let args: object;
                if (typeof validator === 'function') {
                    _validator = validator;
                } else {
                    _validator = validator.validator;
                    args = validator.arguments;
                }
                return _validator.bind(null, {
                    ...(args || {}),
                    value: this._model.value
                });
            })
        );
    }

    private _updateValidationController(options): void {
        this._validationContainer = options.validateByFocusOut ? InputContainer : Container;
    }

    static getDefaultOptions(): object {
        return {
            ...IDateTimeMask.getDefaultOptions(),
            ...getValueValidatorsDefaultOptions(),
            autocompleteType: 'default',
            inputMode: INPUT_MODE.default
        };
    }

    static getOptionTypes(): object {
        return {
            ...IDateTimeMask.getOptionTypes(),
            ...getValueValidatorsOptionTypes()
        };
    }
}

Object.defineProperty(DateTime, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return DateTime.getDefaultOptions();
   }
});

export default DateTime;
