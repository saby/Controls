import {detection} from 'Env/Env';
import {descriptor} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
    IHeight, IHeightOptions, IFontColorStyle,
    IFontColorStyleOptions, IFontSize, IFontSizeOptions, IFontWeightOptions, IFontWeight,
    IBorderStyle, IBorderStyleOptions, IValidationStatus,
    IValidationStatusOptions, IContrastBackground
} from 'Controls/interface';
import IBorderVisibility, {
    TBorderVisibility, IBorderVisibilityOptions,
    getDefaultBorderVisibilityOptions, getOptionBorderVisibilityTypes
} from './interface/IBorderVisibility';

// @ts-ignore
import * as template from 'wml!Controls/_input/Render/Render';

type State =
    'valid'
    | 'valid-active'
    | 'invalid'
    | 'invalid-active'
    | 'invalidAccent'
    | 'invalidAccent-active'
    | 'readonly'
    | 'readonly-multiline'
    | 'success'
    | 'secondary'
    | 'warning';

export interface IBorder {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
}

export interface IRenderOptions extends IControlOptions, IHeightOptions, IBorderVisibilityOptions,
    IFontColorStyleOptions, IFontSizeOptions, IFontWeightOptions, IValidationStatusOptions, IBorderStyleOptions {
    /**
     * @name Controls/_input/Render#multiline
     * @cfg {Boolean} Определяет режим рендеринга текстового поля.
     * @remark
     * * false - однострочный режим.
     * * true - многострочный режим.
     */
    multiline: boolean;
    /**
     * @name Controls/_input/Render#roundBorder
     * @cfg {Boolean} Определяет скругление рамки текстого поля.
     * @remark
     * * false - квадратная рамка.
     * * true - круглая рамка.
     */
    roundBorder: boolean;

    /**
     * @name Controls/_input/Render#content
     * @cfg {HTMLElement} Шаблон текстового поля
     */
    content: TemplateFunction;
    /**
     * @name Controls/_input/Render#leftFieldWrapper
     * @cfg {HTMLElement}
     */
    leftFieldWrapper?: TemplateFunction;
    /**
     * @name Controls/_input/Render#rightFieldWrapper
     * @cfg {HTMLElement}
     */
    rightFieldWrapper?: TemplateFunction;
    state: string;
    border: IBorder;
    wasActionByUser: boolean;

    /**
     * @name Controls/_input/Render#contrastBackground
     * @cfg {Boolean} Определяет контрастность фона контрола по отношению к ее окружению.
     * @default true
     * @variant true Контрастный фон.
     * @variant false Фон, гармонично сочетающийся с окружением.
     * @demo Controls-demo/Input/ContrastBackground/Index
     */
    contrastBackground: boolean;
}

/**
 * Контрол для рендеринга текстового поля.
 *
 * @class Controls/_input/Render
 * @extends UI/_base/Control
 *
 * @mixes Controls/interface:IHeight
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IFontWeight
 * @mixes Controls/interface:IBorderStyle
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IValidationStatus
 * @mixes Controls/input:ITag
 * @mixes Controls/input:IBorderVisibility
 * @implements Controls/interface:IContrastBackground
 *
 * @author Красильников А.С.
 * @private
 */

/**
 * @name Controls/_input/Render#fontWeight
 * @demo Controls-demo/Input/FontWeight/Index
 */

class Render extends Control<IRenderOptions> implements IHeight, IFontColorStyle, IFontSize, IFontWeight,
                                                        IValidationStatus, IBorderStyle,
                                                        IBorderVisibility, IContrastBackground {
    protected _tag: SVGElement | null = null;
    private _border: IBorder = null;
    private _contentActive: boolean = false;

    protected _state: string;
    protected _statePrefix: string;
    protected _fontSize: string;
    protected _fontWeight: string;
    protected _inlineHeight: string;
    protected _fontColorStyle: string;
    protected _template: TemplateFunction = template;

    readonly '[Controls/_interface/IHeight]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IFontWeight]': boolean = true;
    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;
    readonly '[Controls/_interface/IValidationStatus]': boolean = true;
    readonly '[Controls/interface/IBorderStyle]': boolean = true;
    readonly '[Controls/interface/IBorderVisibility]': boolean = true;
    readonly '[Controls/_interface/IContrastBackground]': boolean = true;

    private _setState(options: IRenderOptions): void {
        if (options.state === '') {
            this._state = `${this._calcState(options)}`;
            this._statePrefix = '';
        } else {
            this._state = `${options.state}-${this._calcState(options)}`;
            this._statePrefix = `_${options.state}`;
        }
    }

    private _calcState(options: IRenderOptions): State {
        if (options.readOnly) {
            if (options.multiline) {
                return 'readonly-multiline';
            }

            return 'readonly';
        }
        if (options.borderStyle && options.validationStatus === 'valid') {
            return options.borderStyle;
        }

        if (this._contentActive && Render.notSupportFocusWithin()) {
            return options.validationStatus + '-active';
        }
        return options.validationStatus;
    }

    protected _tagClickHandler(event: SyntheticEvent<MouseEvent>): void {
        this._notify('tagClick', [this._children.tag]);
    }

    protected _tagHoverHandler(event: SyntheticEvent<MouseEvent>): void {
        this._notify('tagHover', [this._children.tag]);
    }

    protected _beforeMount(options: IRenderOptions): void {
        this._border = Render._detectToBorder(options.borderVisibility, options.multiline);
        this._fontWeight = Render._getFontWeight(options.fontWeight, options.fontSize);
        this._setState(options);
    }

    protected _beforeUpdate(options: IRenderOptions): void {
        if (options.borderVisibility !== this._options.borderVisibility) {
            this._border = Render._detectToBorder(options.borderVisibility, options.multiline);
        }
        if (options.fontWeight !== this._options.fontWeight || options.fontSize !== this._options.fontSize) {
            this._fontWeight = Render._getFontWeight(options.fontWeight, options.fontSize);
        }
        this._setState(options);
    }

    protected _setContentActive(event: SyntheticEvent<FocusEvent>, newContentActive: boolean): void {
        this._contentActive = newContentActive;

        this._setState(this._options);
    }

    static _theme: string[] = ['Controls/input', 'Controls/Classes'];

    private static notSupportFocusWithin(): boolean {
        return detection.isIE || (detection.isWinXP && detection.yandex);
    }

    private static _detectToBorder(borderVisibility: TBorderVisibility, multiline: boolean): IBorder {
        switch (borderVisibility) {
            case 'visible':
                return {
                    top: true,
                    right: true,
                    bottom: true,
                    left: true
                };
            case 'partial':
                return {
                    top: multiline,
                    right: false,
                    bottom: true,
                    left: false
                };
            case 'hidden':
                return {
                    top: false,
                    right: false,
                    bottom: false,
                    left: false
                };
        }
    }

    private static _getFontWeight(fontWeight: string, fontSize: string): string {
        if (fontWeight) {
            return fontWeight;
        } else if (fontSize === '3xl') {
            return 'bold';
        }

        return 'default';
    }

    static getDefaultTypes(): object {
        return {
            ...getOptionBorderVisibilityTypes(),
            content: descriptor(Function).required(),
            rightFieldWrapper: descriptor(Function),
            leftFieldWrapper: descriptor(Function),
            multiline: descriptor(Boolean).required(),
            roundBorder: descriptor(Boolean).required(),
            contrastBackground: descriptor(Boolean)
        };
    }

    static getDefaultOptions(): Partial<IRenderOptions> {
        return {
            ...getDefaultBorderVisibilityOptions(),
            contrastBackground: true,
            state: '',
            validationStatus: 'valid'
        };
    }
}

Object.defineProperty(Render, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Render.getDefaultOptions();
   }
});

export default Render;
