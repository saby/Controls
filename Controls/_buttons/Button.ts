import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ActualApi from './ActualApi';
import {IButton, IButtonOptions} from './interface/IButton';
import {IClick} from './interface/IClick';
import {
    ICaption,
    ICaptionOptions,
    IFontColorStyle,
    IFontColorStyleOptions,
    IFontSize,
    IFontSizeOptions,
    IHeight,
    IHeightOptions,
    IIcon,
    IIconOptions,
    IIconSize,
    IIconSizeOptions,
    IIconStyle,
    IIconStyleOptions,
    ITooltip,
    ITooltipOptions,
    IHref,
    IHrefOptions
} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import ButtonTemplate = require('wml!Controls/_buttons/Button');
import 'wml!Controls/_buttons/ButtonBase';

export type IViewMode = 'button' | 'link' | 'toolButton' | 'functionalButton';

export interface IButtonControlOptions extends IControlOptions, IHrefOptions, ICaptionOptions, IIconOptions,
    IIconStyleOptions, IIconSizeOptions, IFontColorStyleOptions, IFontSizeOptions, IHeightOptions, ITooltipOptions,
    IButtonOptions {
    viewMode?: IViewMode;
    captionPosition: 'left' | 'right';
}

export function cssStyleGeneration(options: IButtonControlOptions, hasMsg: boolean = false): void {
    const currentButtonClass = ActualApi.styleToViewMode(options.style);
    const oldViewModeToken = ActualApi.viewMode(currentButtonClass.viewMode, options.viewMode);

    this._buttonStyle = ActualApi.buttonStyle(currentButtonClass.style, options.style, options.buttonStyle, options.readOnly, hasMsg);
    this._contrastBackground = ActualApi.contrastBackground(options, hasMsg);
    this._viewMode = oldViewModeToken.viewMode;
    if (typeof oldViewModeToken.contrast !== 'undefined') {
        this._contrastBackground = oldViewModeToken.contrast;
    }
    this._height = ActualApi.actualHeight(options.size, options.inlineHeight, this._viewMode, hasMsg);
    this._fontColorStyle = ActualApi.fontColorStyle(this._buttonStyle, this._viewMode, options.fontColorStyle);
    this._fontSize = ActualApi.fontSize(options, hasMsg);
    this._hasIcon = !!options.icon;

    this._caption = options.caption;
    this._stringCaption = typeof options.caption === 'string';
    this._captionPosition = options.captionPosition || 'right';

    this._icon = options.icon;
    this._iconSize = options.icon ? ActualApi.iconSize(options.iconSize, this._icon) : '';
    this._iconStyle = options.icon ?
        ActualApi.iconStyle(options.iconStyle, this._icon, options.readOnly, options.buttonAdd) : '';

    if (this._viewMode === 'linkButton') {
        const actualState = ActualApi.actualLinkButton(this._viewMode, this._height);
        this._viewMode = actualState.viewMode;
        this._height = actualState.height;
    }
}

export function defaultHeight(viewMode: string): string {
    if (viewMode === 'button') {
        return 'default';
    } else if (viewMode === 'toolButton' || viewMode === 'pushButton' || viewMode === 'functionalButton') {
        return 'l';
    }
}

export function defaultFontColorStyle(viewMode: string): string {
    if (viewMode === 'link') {
        return 'link';
    }
}

export function simpleCssStyleGeneration(options: IButtonControlOptions): void {
    this._buttonStyle = options.readOnly ? 'readonly' : options.buttonStyle;
    this._contrastBackground = options.contrastBackground;
    this._viewMode = options.viewMode;
    this._height = options.inlineHeight ? options.inlineHeight : defaultHeight(this._viewMode);
    this._fontColorStyle = options.fontColorStyle ? options.fontColorStyle : defaultFontColorStyle(this._viewMode);
    this._fontSize = options.fontSize;
    this._hasIcon = !!options.icon;

    this._caption = options.caption;
    // На сервере rk создает инстанс String'a, проверки на typeof недостаточно
    this._stringCaption = typeof options.caption === 'string' || options.caption instanceof String;
    this._captionPosition = options.captionPosition || 'right';

    this._icon = options.icon;
    if (options.icon) {
        this._iconSize = options.iconSize;
        if (options.readOnly) {
            this._iconStyle = 'readonly';
        } else {
            this._iconStyle =  options.buttonAdd ? 'default' : options.iconStyle;
        }
    }
    if (this._viewMode === 'linkButton') {
        const actualState = ActualApi.actualLinkButton(this._viewMode, this._height);
        this._viewMode = actualState.viewMode;
        this._height = actualState.height;
    }
}

export function getDefaultOptions(): object {
    return {
        viewMode: 'button',
        iconStyle: 'secondary',
        iconSize: 'm',
        captionPosition: 'right',
        contrastBackground: false,
        fontSize: 'm',
        buttonStyle: 'secondary'
    };
}

/**
 * Графический контрол, который предоставляет пользователю возможность простого запуска события при нажатии на него.
 *
 * @remark
 * Кнопки могут отображаться в нескольких режимах, отличающихся друга от друга внешне.
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FButtons%2FStandart%2FIndex демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/buttons-switches/buttons-links/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_buttons.less переменные тем оформления}
 *
 * @class Controls/_buttons/Button
 * @extends Core/Control
 * @mixes Controls/interface:IHref
 * @mixes Controls/_buttons/interface/IButton
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_buttons/interface/IClick
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_interface/IIconStyle
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/ITooltip
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Buttons/ViewModes/Index
 */

/*
 * Graphical control element that provides the user a simple way to trigger an event.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FButtons%2FStandart%2FIndex">Demo-example</a>.
 *
 * @class Controls/_buttons/Button
 * @extends Core/Control
 * @mixes Controls/interface:IHref
 * @mixes Controls/_buttons/interface/IButton
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_buttons/interface/IClick
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_interface/IIconStyle
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/ITooltip
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Buttons/ViewModes/Index
 */
class Button extends Control<IButtonControlOptions> implements IHref, ICaption, IIcon, IIconStyle, ITooltip, IIconSize, IClick, IFontColorStyle, IFontSize, IHeight, IButton {
    protected _template: TemplateFunction = ButtonTemplate;

    // Называть _style нельзя, так как это состояние используется для темизации
    protected _buttonStyle: string;
    protected _fontColorStyle: string;
    protected _fontSize: string;
    protected _contrastBackground: boolean;
    protected _hasIcon: boolean;
    protected _viewMode: string;
    protected _height: string;
    protected _caption: string | TemplateFunction;
    protected _stringCaption: boolean;
    protected _captionPosition: string;
    protected _icon: string;
    protected _iconSize: string;
    protected _iconStyle: string;
    protected _hoverIcon: boolean = true;

    protected _beforeMount(options: IButtonControlOptions): void {
        simpleCssStyleGeneration.call(this, options);
    }

    protected _beforeUpdate(newOptions: IButtonControlOptions): void {
        simpleCssStyleGeneration.call(this, newOptions);
    }

    protected _keyUpHandler(e: SyntheticEvent<KeyboardEvent>): void {
        if (e.nativeEvent.keyCode === 13 && !this._options.readOnly) {
            this._notify('click');
        }
    }

    protected _clickHandler(e: SyntheticEvent<MouseEvent>): void {
        if (this._options.readOnly) {
            e.stopPropagation();
        }
    }

    static _theme: string[] = ['Controls/buttons', 'Controls/Classes'];

    static getDefaultOptions(): object {
        return getDefaultOptions();
    }
}

/**
 * @name Controls/_buttons/Button#viewMode
 * @cfg {Enum} Режим отображения кнопки.
 * @variant button В виде обычной кнопки по-умолчанию.
 * @variant link Устаревший режим отображения кнопки. Не рекомендован к использованию, потому что при его использовании кнопка выравнивается неправильно. Вместо значениея "link" используйте значение "linkButton".
 * @variant linkButton В виде гиперссылки.
 * @variant toolButton В виде кнопки для панели инструментов.
 * @variant functionalButton В виде кнопки выполняющей определенную функцию. Например добавление или сохранение.
 * @default button
 * @demo Controls-demo/Buttons/ViewModes/Index
 * @example
 * Кнопка в режиме отображения 'linkButton'.
 * <pre class="brush: html">
 * <Controls.buttons:Button caption="Send document" buttonStyle="primary" viewMode="linkButton" fontSize="3xl"/>
 * </pre>
 * Кнопка в режиме отображения 'toolButton'.
 * <pre class="brush: html">
 * <Controls.buttons:Button caption="Send document" buttonStyle="danger" viewMode="toolButton"/>
 * </pre>
 * Кнопка в режиме отображения 'button'.
 * <pre class="brush: html">
 * <Controls.buttons:Button caption="Send document" buttonStyle="success" viewMode="button"/>
 * </pre>
 * @see Size
 */

/*
 * @name Controls/_buttons/Button#viewMode
 * @cfg {Enum} Button view mode.
 * @variant link Decorated hyperlink.
 * @variant button Default button.
 * @variant toolButton Toolbar button.
 * @default button
 * @example
 * Button with 'link' viewMode.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" buttonStyle="primary" viewMode="link" fontSize="3xl"/>
 * </pre>
 * Button with 'toolButton' viewMode.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" buttonStyle="danger" viewMode="toolButton"/>
 * </pre>
 * Button with 'button' viewMode.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" buttonStyle="success" viewMode="button"/>
 * </pre>
 * @see Size
 */

/**
 * @name Controls/_buttons/Button#captionPosition
 * @cfg {String} Определяет, с какой стороны расположен текст кнопки относительно иконки.
 * @variant left Текст расположен перед иконкой.
 * @variant right Текст расположен после иконки.
 * @default right
 * @demo Controls-demo/Buttons/CaptionPosition/Index
 */

/*
 * @name Controls/_buttons/Button#captionPosition
 * @cfg {String} Determines on which side of the icon caption is located.
 * @variant left Caption before icon.
 * @variant right Icon before caption.
 * @default right
 */

/**
 * @name Controls/_buttons/Button#fontSize
 * @cfg
 * @demo Controls-demo/Buttons/SizesAndHeights/Index
 * @example
 * <pre class="brush: html">
 * <Controls.buttons:Button icon="icon-Add" fontSize="xl" viewMode="button"/>
 * </pre>
 */

export default Button;
