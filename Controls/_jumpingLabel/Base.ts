import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
    IValidationStatus, IValidationStatusOptions, ValidationStatus,
    TBorderVisibility, ICaption, ICaptionOptions
} from 'Controls/interface';

type TValidationStatus = 'valid' | 'invalid';
type TValidationFontColorStyle = 'default' | 'accent';

/**
 * @interface Controls/_jumpingLabel/IBaseOptions
 * @public
 * @author Красильников А.С.
 */
export interface IBaseOptions extends IControlOptions, IValidationStatusOptions, ICaptionOptions {
    content: TemplateFunction;
    /**
     * Определяет оформление в зависимости от контрастности фона.
     */
    contrastBackground: boolean;
    /**
     * Стиль цвета текста контрола провалившего валидацию.
     */
    validationFontColorStyle: TValidationFontColorStyle;
}

/**
 * Абстрактный класс для реализации контрола, добавляющего поведение прыгающей метки к своему контенту.
 *
 * @class Controls/_jumpingLabel/Base
 * @extends UI/Base:Control
 *
 * @mixes Controls/_jumpingLabel/IBaseOptions
 * @mixes Controls/interface:IValidationStatus
 *
 * @public
 * @demo Controls-demo/JumpingLabel/Index
 *
 * @author Красильников А.С.
 */
abstract class Base<T extends IBaseOptions = IBaseOptions>
    extends Control<T> implements IValidationStatus, ICaption {
    protected _showFromAbove: boolean = null;
    protected _fontColorStyle: string = null;
    protected _validationStatus: string = null;
    protected _horizontalPadding: string = null;
    protected _containerHorizontalPadding: string = null;
    protected _borderVisibility: TBorderVisibility = null;

    readonly '[Controls/_interface/ICaption]': boolean = true;
    readonly '[Controls/_interface/IValidationStatus]': boolean = true;

    protected _beforeMount(options?: T, contexts?: object, receivedState?: void): Promise<void> | void {
        this._borderVisibility = Base._detectToBorderVisibility();
        this._setShowFromAbove(options);
        this._setStateByOptions(options);

        return super._beforeMount(options, contexts, receivedState);
    }

    protected _beforeUpdate(options?: T, contexts?: any): void {
        this._setStateByOptions(options);

        super._beforeUpdate(options, contexts);
    }

    private _setStateByOptions(options: T): void {
        this._horizontalPadding = Base._detectToHorizontalPadding(options.contrastBackground);
        this._containerHorizontalPadding = Base._detectToHorizontalPadding(!options.contrastBackground);
        this._fontColorStyle = Base._detectToFontColorStyle(
            options.validationStatus, options.validationFontColorStyle
        );
        this._validationStatus = Base._detectToValidationStatus(options.validationStatus);
    }

    protected abstract _setShowFromAbove(options: T): void;

    static _theme: string[] = ['Controls/jumpingLabel'];

    private static _detectToHorizontalPadding(contrastBackground: boolean): string {
        return contrastBackground ? 'xs' : 'null';
    }

    private static _detectToBorderVisibility(): TBorderVisibility {
        return 'partial';
    }

    private static _detectToFontColorStyle(
        validationStatus: ValidationStatus, validationFontColorStyle: TValidationFontColorStyle
    ): string {
        if (validationStatus === 'valid') {
            return 'valid';
        } else {
            return `invalid-${validationFontColorStyle}`;
        }
    }

    private static _detectToValidationStatus(validationStatus: ValidationStatus): TValidationStatus {
        /**
         * Для полей ввода с оформлением, которое задается через HOC, стандартом не предусмотрено значение invalidAccent(при фокусе меняется background).
         * Этот код при надобности может быть перенесен в поля ввода с проверкой на опцию borderVisibility === 'partial'.
         */
        if (validationStatus === 'valid') {
            return 'valid';
        } else {
            return 'invalid';
        }
    }

    static getDefaultOptions(): object {
        return {
            validationStatus: 'valid',
            validationFontColorStyle: 'default'
        };
    }

    static getOptionTypes(): object {
        return {
            validationStatus: descriptor<string>(String),
            caption: descriptor<string>(String).required(),
            inputDisplayValue: descriptor<null | string>(null, String),
            validationFontColorStyle: descriptor<string>(String).oneOf(['default', 'accent'])
        };
    }
}

export default Base;
