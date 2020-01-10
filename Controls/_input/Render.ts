import {detection} from 'Env/Env';
import {descriptor} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as ActualAPI from 'Controls/_input/ActualAPI';
import {
   IHeight, IHeightOptions, IFontColorStyle,
   IFontColorStyleOptions, IFontSize, IFontSizeOptions,
   IBorderStyle, IBorderStyleOptions, IValidationStatus, IValidationStatusOptions
} from 'Controls/interface';

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

interface IRenderOptions extends IControlOptions, IHeightOptions,
    IFontColorStyleOptions, IFontSizeOptions, IValidationStatusOptions, IBorderStyleOptions {
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
     * @name Controls/_input/Render#beforeFieldWrapper
     * @cfg {HTMLElement}
     */
    beforeFieldWrapper?: TemplateFunction;
    /**
     * @name Controls/_input/Render#afterFieldWrapper
     * @cfg {HTMLElement}
     */
    afterFieldWrapper?: TemplateFunction;
}

/**
 * Контрол для рендеринга текстового поля.
 *
 * @class Controls/_input/Render
 * @extends UI/_base/Control
 *
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_input/interface/ITag
 * @mixes Controls/_interface/IValidationStatus
 * @mixes Controls/interface/IBorderStyle
 *
 * @author Красильников А.С.
 * @private
 */

class Render extends Control<IRenderOptions> implements IHeight, IFontColorStyle, IFontSize, IValidationStatus, IBorderStyle {
    private _tag: SVGElement | null = null;
    private _contentActive: boolean = false;

    protected _state: string;
    protected _fontSize: string;
    protected _inlineHeight: string;
    protected _fontColorStyle: string;
    protected _validationStatus: string;
    protected _template: TemplateFunction = template;
    protected _theme: string[] = ['Controls/input', 'Controls/Classes'];

   readonly '[Controls/_interface/IHeight]': true;
   readonly '[Controls/_interface/IFontSize]': true;
   readonly '[Controls/_interface/IFontColorStyle]': true;
   readonly '[Controls/_interface/IValidationStatus]': true;
   readonly '[Controls/interface/IBorderStyle]': true;

    private updateState(options: IRenderOptions): void {
        this._fontSize = ActualAPI.fontSize(options.fontStyle, options.fontSize);
        this._inlineHeight = ActualAPI.inlineHeight(options.size, options.inlineHeight);
        this._fontColorStyle = ActualAPI.fontColorStyle(options.fontStyle, options.fontColorStyle);
        this._validationStatus = ActualAPI.validationStatus(options.style, options.validationStatus);
        this._state = `${options.state}${this.calcState(options)}`;
    }

    private calcState(options: IRenderOptions): State {
        if (options.readOnly) {
            if (options.multiline) {
                return 'readonly-multiline';
            }

            return 'readonly';
        }
        if (options.borderStyle && this._validationStatus === 'valid') {
            return options.borderStyle;
        }

        if (this._contentActive && Render.notSupportFocusWithin()) {
            return this._validationStatus + '-active';
        }
        return this._validationStatus;
    }

    private _tagClickHandler(event: SyntheticEvent<MouseEvent>) {
        this._notify('tagClick', [this._children.tag]);
    }

    private _tagHoverHandler(event: SyntheticEvent<MouseEvent>) {
        this._notify('tagHover', [this._children.tag]);
    }

    protected _beforeMount(options: IRenderOptions): void {
        this.updateState(options);
    }

    protected _beforeUpdate(options: IRenderOptions): void {
        this.updateState(options);
    }

    protected _setContentActive(event: SyntheticEvent<FocusEvent>, newContentActive: boolean): void {
        this._contentActive = newContentActive;

        this.updateState(this._options);
    }

    private static notSupportFocusWithin(): boolean {
        return detection.isIE || (detection.isWinXP && detection.yandex);
    }

    static getDefaultTypes() {
        return {
            content: descriptor(Function).required(),
            afterFieldWrapper: descriptor(Function),
            beforeFieldWrapper: descriptor(Function),
            multiline: descriptor(Boolean).required(),
            roundBorder: descriptor(Boolean).required()
        };
    }

    static getDefaultOptions() {
        return {
            state: ''
        };
    }
}

export default Render;

/*
 * Control the rendering of text fields.
 *
 * @class Controls/_input/Render
 * @extends UI/_base/Control
 *
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 *
 * @public
 *
 * @author Krasilnikov A.S.
 */
